import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "collegeuser",
  password: "sdcfvRfsdlWckldk",
  database: "collegegram",
  synchronize: true,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
