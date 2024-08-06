import { Router } from "express";
import { loginUserDto } from "../modules/user/dto/login-user.dto";
import { handleExpress } from "../utilities/handle-express";
import { UserService } from "../modules/user/user.service";

export const makeUserRouter = (userService: UserService) => {
  const app = Router();

  app.post("/login", (req, res) => {
    const dto = loginUserDto.parse(req.body);
    handleExpress(res, () => userService.login(dto));
  });

  return app;
};
