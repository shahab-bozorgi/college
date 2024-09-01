import request from "supertest";
import { Express } from "express";
import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";
import { UserId } from "../../modules/user/model/user-user-id";
import { loginSeedUser } from "../login-seed-user";
import { seedUser } from "../seed";
import { Username } from "../../modules/user/model/user-username";
import { Password } from "../../modules/user/model/user-password";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "../../modules/user/entity/user.entity";
import { truncateTableOfRepos } from "../truncate-data";
import { FollowEntity } from "../../modules/user/follow/entity/follow.entity";

describe("Follow test suite", () => {
  let app: Express;
  let dataSource: DataSource;
  let userRepository: Repository<UserEntity>;
  let followRepository: Repository<FollowEntity>;
  let token: string;
  let userId: UserId;
  let followingUser: { userId: UserId; username: Username; password: Password };
  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    userRepository = dataSource.getRepository(UserEntity);
    followRepository = dataSource.getRepository(FollowEntity);
    app = makeApp(dataSource);
    ({ userId, token } = await loginSeedUser(dataSource));
    followingUser = await seedUser(
      dataSource,
      "omid" as Username,
      "Omid@1234" as Password
    );
  });

  afterAll(async () => {
    console.log(dataSource.dropDatabase);
    if (dataSource) await dataSource.destroy();
    await truncateTableOfRepos([followRepository, userRepository]);
  });

  describe("Follow User", () => {
    it("should follow user if users are exist, follower is logged in and not duplicated follow", async () => {
      await request(app)
        .post(`/users/follow/${followingUser.userId}`)
        .set("Accept", "application/json")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.ok).toEqual(true);
        });
    });
  });
});
