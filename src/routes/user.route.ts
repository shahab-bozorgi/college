import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { toUsername, Username } from "../modules/user/model/user-username";
import { EditProfileDto } from "../modules/user/dto/edit-profile.dto";
import { MBToBytes, uploadSingleFile } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { MediaService } from "../modules/media/media.service";
import { NoneEmptyString } from "../data/non-empty-string";
import { imageMIMEs, MIME } from "../modules/media/field-types/mime";
import { expressHandler, handleExpress } from "../utilities/handle-express";
import { UserId } from "../modules/user/model/user-user-id";
import { PostService } from "../modules/post/post.service";
import { FollowService } from "../modules/user/follow/follow.service";
import { parseDtoWithSchema } from "../utilities/parse-dto-handler";
import { FollowDto } from "../modules/user/follow/dto/follow.dto";
import { UnFollowDto } from "../modules/user/follow/dto/unfollow.dto";
import { GetFollowingListsSchema } from "../modules/user/follow/dto/get-followings.dto";
import { GetFollowerListsSchema } from "../modules/user/follow/dto/get-followers.dto";

export const makeUserRouter = (
  userService: UserService,
  followService: FollowService,
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
    const username = (req.query.username as Username) ?? req.user.username;
    handleExpress(res, () =>
      userService.userProfile(username, req.user, postService, followService)
    );
  });

  app.get("/:username", (req, res) => {
    const username: Username = toUsername(req.params.username);
    const user = userService.findByUsername(username);
    res.status(200).send(user);
  });

  app.post("/follow/:followingId", async (req, res, next) => {
    const dto = parseDtoWithSchema(
      {
        followerId: req.user.id,
        followingId: req.params.followingId,
      },
      FollowDto
    );
    expressHandler(req, res, () => {
      return followService.followUser(
        dto.followerId,
        dto.followingId,
        userService
      );
    });
  });

  app.delete("/unfollow/:followingId", async (req, res, next) => {
    const dto = parseDtoWithSchema(
      {
        followerId: req.user.id,
        followingId: req.params.followingId,
      },
      UnFollowDto
    );
    expressHandler(req, res, () => {
      return followService.unfollowUser(
        dto.followerId,
        dto.followingId,
        userService
      );
    });
  });

  app.get("/:userId/followers", async (req, res) => {
    const dto = parseDtoWithSchema(
      {
        followingId: req.params.userId,
        page: req.query.page,
        limit: req.query.limit,
      },
      GetFollowerListsSchema
    );
    expressHandler(req, res, () => {
      return followService.getFollowers({
        followingId: dto.followingId,
        page: dto.page,
        limit: dto.limit,
      });
    });
  });

  app.get("/:userId/followings", async (req, res) => {
    const dto = parseDtoWithSchema(
      {
        followerId: req.params.userId,
        page: req.query.page,
        limit: req.query.limit,
      },
      GetFollowingListsSchema
    );
    expressHandler(req, res, () => {
      return followService.getFollowings({
        followerId: dto.followerId,
        page: dto.page,
        limit: dto.limit,
      });
    });
  });
  return app;
};
