import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { CreatePostSchema } from "../modules/post/dto/create-post.dto";
import { MBToBytes, uploadMultipleFiles } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { imageMIMEs } from "../modules/media/field-types/mime";
import { UserService } from "../modules/user/user.service";
import { v4 } from "uuid";
import { TagService } from "../modules/tag/tag.service";
import { UpdatePostSchema } from "../modules/post/dto/update-post.dto";
import { PostId } from "../modules/post/field-types/post-id";

export const makePostRouter = (
  postService: PostService,
  userService: UserService,
  tagService: TagService
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
        await postService.create(
          req.user,
          req.files,
          dto,
          userService,
          tagService
        );
        res.status(201).json({ ok: true, data: {} });
      } catch (e) {
        next(e);
      }
    }
  );

  app.patch(
    "/:id",
    uploadMultipleFiles(
      uploadPath,
      "pictures",
      imageMIMEs,
      MBToBytes(5 as PositiveInt)
    ),
    async (req, res, next) => {
      try {
        const dto = UpdatePostSchema.parse(req.body);
        await postService.update(
          req.params.id as PostId,
          req.user.id,
          dto,
          userService,
          tagService,
          Array.isArray(req.files) ? req.files : undefined
        );
        res.status(200).json({ ok: true, data: {} });
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

  app.get("/:postId/comments", (req, res) => {
    const comment1Id = v4();

    const description1 = "first comment";

    const comment1 = {
      id: comment1Id,
      username: "ali",
      firstname: "Ali",
      lastname: "Ahmadi",
      parentId: null,
      postId: req.params.postId,
      description: description1,
      likeCount: 2,
      createdAt: "2024-08-12 09:43:31.408585",
    };

    const description2 = "second comment";

    const comment2 = {
      id: v4(),
      username: "arefe",
      firstname: "Arefe",
      lastname: "Alavi",
      parentId: comment1Id,
      postId: req.params.postId,
      description: description2,
      likeCount: 5,
      createdAt: "2024-08-19 10:56:36",
    };

    const data = [comment1, comment2];

    res.status(200).json({ ok: true, data });

    //   handleExpress(res, () => { return { id: v4(), ...dto } });
  });

  app.get("/:postId/comments", (req, res) => {

    const comment1Id = v4();

    const description1 = "first comment";

    const comment1 = {
      id: comment1Id,
      parentId: null,
      postId: req.params.postId,
      description: description1,
      likeCount: 2,
      createdAt: "2024-08-12 09:43:31.408585",
    };
    
    const description2 = "second comment";

    const comment2 = {
      id: v4(),
      username: "arefe",
      firstname: "Arefe",
      lastname: "Alavi",
      parentId: comment1Id,
      postId: req.params.postId,
      description: description2,
      likeCount: 5,
      createdAt: "2024-08-19 10:56:36",
    };

    const data = [
      comment1,
      comment2,
    ];

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
