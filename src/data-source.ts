import "reflect-metadata";
import dotenv from "dotenv-flow";
dotenv.config();
import { DataSource } from "typeorm";
import { UserEntitiy } from "./modules/user/entity/user.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [UserEntitiy],
  migrations: [],
  subscribers: [],
  dropSchema: process.env.NODE_ENV === "test",
});
