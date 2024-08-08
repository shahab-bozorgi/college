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

  describe("Sign-up", () => {
    it("should sign up user if username & emial is unique", async () => {
      await request(app)
        .post("/auth/sign-up")
        .send({
          username: "shahab",
          email: "a@gmail.com",
          password: "Password1",
          confirmPassword: "Password1",
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty("id");
        });
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
