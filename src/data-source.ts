import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./modules/user/entity/user.entity";
import dotenv from "dotenv-flow";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [UserEntity],
  migrations: [],
  subscribers: [],
  dropSchema: process.env.NODE_ENV === "test",
});

export const TestDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: process.env.TEST_DB_USERNAME,
  password: process.env.TEST_DB_PASS,
  database: process.env.TEST_DB_NAME,
  synchronize: true,
  logging: false,
  entities: [UserEntity],
  migrations: [],
  subscribers: [],
  dropSchema: process.env.NODE_ENV === "test",
});
