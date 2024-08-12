import request from "supertest";
import { Express, response } from "express";
import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";
import { seedUser } from "../seed";
import { HttpError, UnAuthorized } from "../../utilities/http-error";

describe("User test suite", () => {
  let app: Express;
  beforeAll(async () => {
    const dataSource = await AppDataSource.initialize();
    app = makeApp(dataSource);
    await seedUser();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("siginup", () => {
    it("should create user if username & emial is unique", async () => {
      await request(app)
        .post("/user/signup")
        .send({
          username: "shahab",
          email: "a@gmail.com",
          password: "Password1",
          confirmPassword: "Password1",
        })
        .expect(200);
    });
  });

  describe("Login", () => {
    it("should user login if username and password is correct", async () => {
      await request(app)
        .post("/auth/login")
        .send({
          username: "ali",
          password: "Ali@1234",
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty("token");
        });
    });
  });
});
