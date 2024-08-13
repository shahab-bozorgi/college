import { Router } from "express";
import { loginUserDto } from "../modules/user/dto/login-user.dto";
import { handleExpress } from "../utilities/handle-express";
import { UserService } from "../modules/user/user.service";
import { SignUpSchema } from "../modules/user/dto/create-user.dto";

export const makeAuthRouter = (userService: UserService) => {
  const app = Router();
  
  app.post("/sign-up", (req, res) => {
    const dto = SignUpSchema.parse(req.body);
    handleExpress(res, () => userService.create(dto));
  });

  app.post("/login", (req, res) => {
    const dto = loginUserDto.parse(req.body);
    handleExpress(res, () => userService.login(dto));
  });

  return app;
};
