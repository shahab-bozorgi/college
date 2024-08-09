import { Router } from "express";
import { loginUserDto } from "../modules/user/dto/login-user.dto";
import { handleExpress } from "../utilities/handle-express";
import { UserService } from "../modules/user/user.service";
import { toUsername, Username } from "../modules/user/model/user-username";
import { UpdateUserSchema } from "../modules/user/dto/update-user.dto";

export const makeUserRouter = (userService: UserService) => {
  const app = Router();
  app.get("/profile", (req, res) => {
    res.status(200).json({ ok: true, data: req.user });
  });

  app.get("/:username", async (req, res) => {
    const username: Username = toUsername(req.params.username);
    const user = await userService.findByUsername(username);
    res.status(200).send(user);
  });

  app.patch("/edit-profile", (req, res) => {
    const dto = UpdateUserSchema.parse(req.body.params);
    handleExpress(res, () => userService.update(req.body, dto));
  });

  return app;
};
