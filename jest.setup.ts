import { DataSource } from "typeorm";
import { AppDataSource } from "./src/data-source";

let dataSource: DataSource;

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});
