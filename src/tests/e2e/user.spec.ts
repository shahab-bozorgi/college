import request from "supertest";
import { Express } from "express";
import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";
import { seedUser } from "../seed";
import { DataSource, Repository } from "typeorm";
import { Username } from "../../modules/user/model/user-username";
import { Password } from "../../modules/user/model/user-password";
import { truncateTableOfRepos } from "../truncate-data";
import { UserEntity } from "../../modules/user/entity/user.entity";

describe("User test suite", () => {
  let app: Express;
  let dataSource: DataSource;
  let userRepository: Repository<UserEntity>;
  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    userRepository = dataSource.getRepository(UserEntity);
    app = makeApp(dataSource);
  });

  afterAll(async () => {
    if (dataSource) await dataSource.destroy();
    await truncateTableOfRepos([userRepository]);
  });

  describe("Sign-up", () => {
    it("should sign up user if username & emial is unique", async () => {
      await request(app)
        .post("/auth/sign-up")
        .send({
          username: "shahab",
          email: "shahab@gmail.com",
          password: "Password1",
          confirmPassword: "Password1",
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.ok).toEqual(true);
        });
    });
  });

  describe("Login", () => {
    it("should user login if username and password is correct", async () => {
      const user = await seedUser(
        dataSource,
        "amir" as Username,
        "Amir@1234" as Password
      );

      await request(app)
        .post("/auth/login")
        .send({
          username: user.username,
          password: user.password,
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.ok).toEqual(true);
        });
    });
  });
});
