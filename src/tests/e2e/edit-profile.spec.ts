import request from "supertest";
import { Express } from "express";
import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";

let app: Express;
let token: string;
beforeAll(async () => {
  const dataSource = AppDataSource;
  app = makeApp(dataSource);
  await request(app).post("/auth/sign-up").send({
    username: "testUser",
    email: "abc@g.com",
    password: "Pass1234",
    confirmPassword: "Pass1234",
  });

  const { body: tokenResponse } = await request(app).post("/auth/login").send({
    username: "testUser",
    password: "Pass1234",
  });

  token = tokenResponse.data;
});

afterAll(async () => {});

describe.skip("Edit Profile", () => {
  it("should fail if user is not logged in.", async () => {
    await request(app).patch("/users/profile").send().expect(401);
  });

  const updateInfo = {
    first_name: "Garshasb",
    last_name: "Tahamtan",
    bio: "This bio expresses me.",
  };
  it("should update profile info.", async () => {
    await request(app)
      .patch("/users/profile")
      .set({
        authorization: `Bearer ${token}`,
      })
      .send(updateInfo)
      .expect(200);
  });

  it("should login with older password", async () => {
    const { body: tokenResponse } = await request(app)
      .post("/auth/login")
      .send({
        username: "testUser",
        password: "Pass1234",
      })
      .expect(200);

    token = tokenResponse.data;
  });

  it("should update password", async () => {
    await request(app)
      .patch("/users/profile")
      .set({
        authorization: `Bearer ${token}`,
      })
      .send({
        password: "Garsh1234",
        confirmPassword: "Garsh1234",
      })
      .expect(200);
  });

  it("should login with new password", async () => {
    const { body: tokenResponse } = await request(app)
      .post("/auth/login")
      .send({
        username: "testUser",
        password: "Garsh1234",
      })
      .expect(200);

    token = tokenResponse.data;
  });

  it("updated info should be correct.", async () => {
    const { body: userInfo } = await request(app)
      .get("/users/profile")
      .set({
        authorization: `Bearer ${token}`,
      })
      .expect(200);

    expect(userInfo.data.first_name).toBe(updateInfo.first_name);
    expect(userInfo.data.last_name).toBe(updateInfo.last_name);
    expect(userInfo.data.bio).toBe(updateInfo.bio);
    expect(userInfo.data.username).toBe("testUser");
    expect(userInfo.data.email).toBe("abc@g.com");
    expect(userInfo.data.is_private).toBe(false);
  });
});
