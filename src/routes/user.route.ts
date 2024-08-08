import { Router } from "express";
import { loginUserDto } from "../modules/user/dto/login-user.dto";
import { handleExpress } from "../utilities/handle-express";
import { UserService } from "../modules/user/user.service";
import { SignUpSchema } from "../modules/user/dto/create-user.dto";
import { toUsername, Username } from "../modules/user/model/user-username";

export const makeUserRouter = (userService: UserService) => {
  const app = Router();
  app.post("/signup", (req, res) => {
    const dto = SignUpSchema.parse(req.body);
    handleExpress(res, () => userService.create(dto));
  });

  app.get("/username/:username", async (req, res) => {
    const username: Username = toUsername(req.params.username);
    const user = await userService.findByUsername(username);
    res.status(200).send(user);
  });

  app.post("/login", (req, res) => {
    const dto = loginUserDto.parse(req.body);
    handleExpress(res, () => userService.login(dto));
  });

  return app;
};
