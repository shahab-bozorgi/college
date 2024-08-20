import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { CreatePostSchema } from "../modules/post/dto/create-post.dto";
import { MBToBytes, uploadMultipleFiles } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { imageMIMEs } from "../modules/media/field-types/mime";
import { UserService } from "../modules/user/user.service";

export const makePostRouter = (
  postService: PostService,
  userService: UserService
) => {
  const app = Router();
  const uploadPath = "/posts";

  app.post(
    "/",
    uploadMultipleFiles(
      uploadPath,
      "pictures",
      imageMIMEs,
      MBToBytes(5 as PositiveInt)
    ),
    async (req, res, next) => {
      try {
        const dto = CreatePostSchema.parse(req.body);
        await postService.create(req.user, req.files, dto, userService);
        res.status(201).json({ ok: true, data: {} });
      } catch (e) {
        next(e);
      }
    }
  );
  return app;
};
