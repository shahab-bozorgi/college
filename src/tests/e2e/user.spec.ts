import request from "supertest";
import { Express } from "express";
import { makeApp } from "../../api";
import { TestDataSource } from "../../data-source";
import { seedUser } from "../../seed";

describe("User test suite", () => {
  let app: Express;
  beforeAll(async () => {
    const dataSource = await TestDataSource.initialize();
    app = makeApp(dataSource);
    await seedUser();
  });

  afterAll(async () => {
    await TestDataSource.destroy();
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
        .post("/login")
        .send({
          username: "ali",
          password: "ali1234",
        })
        .expect(200);
    });
  });
});
