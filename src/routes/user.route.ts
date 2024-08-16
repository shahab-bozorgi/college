import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { toUsername, Username } from "../modules/user/model/user-username";
import { EditProfileDto } from "../modules/user/dto/edit-profile.dto";
import {
  imageMIMEs,
  MBToBytes,
  MIME,
  uploadSingleFile,
} from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { MediaService } from "../modules/media/media.service";
import { NoneEmptyString } from "../data/non-empty-string";

export const makeUserRouter = (
  userService: UserService,
  mediaService: MediaService
) => {
  const app = Router();

  app.patch(
    "/profile",
    uploadSingleFile(
      "user/avatar",
      "avatar",
      imageMIMEs,
      MBToBytes(1 as PositiveInt)
    ),
    async (req, res, next) => {
      try {
        const dto = EditProfileDto.parse(req.body);
        if (req.file) {
          const avatar = await mediaService.create({
            name: req.file.filename as NoneEmptyString,
            mime: req.file.mimetype as MIME,
            size: req.file.size,
            path: req.file.path,
          });
          userService.updateAvatar(req.user, avatar!);
        }
        await userService.editProfile(req.user, dto);
        res.json({ ok: true, data: {} });
      } catch (e) {
        next(e);
      }
    }
  );

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
