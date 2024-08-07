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

  describe("Login", () => {
    it("should user login if username and password is correct", async () => {
      await request(app)
        .post("/login")
        .send({
          username: "ali",
          password: "ali1234"
        })
        .expect(200);
    });
  });
});
