import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { CreatePostSchema } from "../modules/post/dto/create-post.dto";
import { MBToBytes, uploadMultipleFiles } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { imageMIMEs } from "../modules/media/field-types/mime";
import { UserService } from "../modules/user/user.service";
import { v4 } from "uuid";

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

  app.post("/:postId/comment", (req, res) => {
    const dto = {
      postId: req.params.postId,
      parentId: req.body.parentId,
      description: req.body.description,
    };

    const data = {
      id: v4(),
      ...dto,
    };

    res.status(200).json({ ok: true, data });

    //   handleExpress(res, () => { return { id: v4(), ...dto } });
  });

  app.post("/:postId/comments/:commentId/like", (req, res) => {
    const dto = {
      commentId: req.params.commentId,
      userId: req.user.id,
    };

    const data = {
      id: v4(),
      ...dto,
    };

    res.status(200).json({ ok: true, data });

    //   handleExpress(res, () => { return { id: v4(), ...dto } });
  });

  return app;
};
