import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { toUsername, Username } from "../modules/user/model/user-username";
import { EditProfileDto } from "../modules/user/dto/edit-peofile.dto";
import { handleExpress } from "../utilities/handle-express";

export const makeUserRouter = (userService: UserService) => {
  const app = Router();

  app.patch("/profile", (req, res) => {
    const dto = EditProfileDto.parse(req.body);
    handleExpress(res, () => userService.editProfile(req.user, dto));
  });

  app.get("/profile", (req, res) => {
    res.status(200).json({ ok: true, data: req.user });
  });

  app.get("/:username", async (req, res) => {
    const username: Username = toUsername(req.params.username);
    const user = await userService.findByUsername(username);
    res.status(200).send(user);
  });

  return app;
};
