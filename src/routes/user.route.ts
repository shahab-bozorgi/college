import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { toUsername, Username } from "../modules/user/model/user-username";
import { EditProfileDto } from "../modules/user/dto/edit-profile.dto";
import { MBToBytes, uploadSingleFile } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { MediaService } from "../modules/media/media.service";
import { NoneEmptyString } from "../data/non-empty-string";
import { imageMIMEs, MIME } from "../modules/media/field-types/mime";
import { handleExpress } from "../utilities/handle-express";
import { UserId } from "../modules/user/model/user-user-id";
import { PostService } from "../modules/post/post.service";

export const makeUserRouter = (
  userService: UserService,
  mediaService: MediaService,
  postService: PostService
) => {
  const app = Router();

  app.patch(
    "/profile",
    uploadSingleFile(
      "users/avatar",
      "avatar",
      imageMIMEs,
      MBToBytes(5 as PositiveInt)
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
          await userService.updateAvatar(req.user, avatar);
        }
        await userService.editProfile(req.user, dto);
        res.json({ ok: true, data: {} });
      } catch (e) {
        next(e);
      }
    }
  );

  app.get("/profile", (req, res) => {
    handleExpress(res, () => userService.userProfile(req.user.id, postService));
  });

  app.get("/:username", (req, res) => {
    const username: Username = toUsername(req.params.username);
    const user = userService.findByUsername(username);
    res.status(200).send(user);
  });

  app.post("/:followerId/follow/:followingId", async (req, res) => {
    const followerId: UserId = req.params.followerId as UserId;
    const followingId: UserId = req.params.followingId as UserId;

    const followEntity = await userService.followUser(followerId, followingId);

    res.status(200).json({
      message: "کاربر با موفقیت فالو شد!",
      followEntity,
    });
  });

  app.delete("/:followerId/unfollow/:followingId", (req, res, next) => {
    const followerId = req.params.followerId as UserId;
    const followingId = req.params.followingId as UserId;
    userService.unfollowUser(followerId, followingId).then(() => {
      res.status(200).json({
        message: "کاربر با موفقیت آنفالو شد!",
      });
    });
  });

  // app.get("/username/:id/following", async (req, res) => {
  //   const userId = req.params.id as UserId;
  //   const { following } = (await userService.userProfile(userId)) ?? {
  //     following: [],
  //   };
  //   res.status(200).json({ following });
  // });

  // app.get("/username/:id/followers", async (req, res) => {
  //   const userId = req.params.id as UserId;
  //   const { followers } = (await userService.userProfile(userId)) ?? {
  //     followers: [],
  //   };
  //   res.status(200).json({ followers });
  // });

  return app;
};
