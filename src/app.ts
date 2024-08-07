import dotenv from "dotenv-flow";
dotenv.config();
import { makeApp } from "./api";
import { AppDataSource } from "./data-source";

const PORT = 3000;
AppDataSource.initialize()
  .then((dataSource) => makeApp(dataSource))
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });
