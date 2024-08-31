import request from "supertest";
import { Express } from "express";
import { seedUser } from "./seed";

export const authMockUser = async (app: Express): Promise<object> => {
  const seedUserResponse = await seedUser();
  const LoginResponse = await request(app).post("/auth/login").send({
    username: seedUserResponse?.username,
    password: seedUserResponse?.password,
  });

  return { userId: seedUserResponse?.id, token: LoginResponse.body.date.token };
};
