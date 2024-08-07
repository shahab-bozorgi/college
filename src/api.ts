import express, { ErrorRequestHandler } from "express";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.route";
import { DataSource } from "typeorm";
import { ZodError } from "zod";

export const makeApp = (dataSource: DataSource) => {
  const app = express();

  app.use(express.json());

  if (process.env.NODE_ENV !== "test") {
    app.use((req, res, next) => {
      console.log(req.method, req.url);
      next();
    });
  }

  const userRepository = new UserRepository(dataSource);
  const userService = new UserService(userRepository);

  app.use(makeUserRouter(userService));

  app.use((req, res) => {
    res.status(404).send({ message: "Not Found!" });
  });

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
      res.status(400).send({ message: err.message });
      return;
    }

    res.status(500);
  };

  app.use(errorHandler);

  return app;
};
