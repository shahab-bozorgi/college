import { makeApp } from "./api";
import { AppDataSource } from "./data-source";
import { LoginMiddleware } from "./modules/user/model/user.model";

declare global {
  namespace Express {
    interface Request {
      user: LoginMiddleware;
    }
  }
}
const PORT = 3000;
AppDataSource.initialize()
  .then((dataSource) => makeApp(dataSource))
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });
