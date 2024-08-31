import request from "supertest";
import { Express, response } from "express";
import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";
import { seedUser } from "../seed";
import { authMockUser } from "../auth-mock";
import { UserId } from "../../modules/user/model/user-user-id";

describe("Follow test suite", () => {
  let app: Express;
  let token: string;
  let userId: UserId;
  beforeAll(async () => {
    const dataSource = await AppDataSource.initialize();
    app = makeApp(dataSource);
    await authMockUser(app);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("Follow User", () => {
    it("should follow user if users are exist, follower is logged in and not duplicated follow", async () => {
      await request(app)
        .post(`/users/follow/${userId}`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty("token");
        });
    });
  });
});
