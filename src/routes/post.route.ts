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
import { PostId } from "../modules/post/model/post-id";
import { CommentService } from "../modules/post/comment/comment.service";
import { LikeCommentService } from "../modules/post/comment/like-comment/like-comment.service";
import { handleExpress } from "../utilities/handle-express";
import { LikeCommentSchema } from "../modules/post/comment/like-comment/dto/like-comment.dto";
import { GetCommentsSchema } from "../modules/post/comment/dto/get-comments.dto";
import { CreateCommentSchema } from "../modules/post/comment/dto/create-comment.dto";

export const makePostRouter = (
  postService: PostService,
  userService: UserService,
  tagService: TagService,
  commentService: CommentService,
  likeCommentService: LikeCommentService
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

  app.get("/:id", (req, res) => {
    handleExpress(res, () => postService.getPost(req.params.id, userService));
  });

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
    const dto = CreateCommentSchema.parse({
      userId: req.user.id,
      postId: req.params.postId,
      parentId: req.body.parentId,
      description: req.body.description,
    });
    handleExpress(res, () =>
      commentService.createComment(dto, userService, postService)
    );
  });

  app.get("/:postId/comments", (req, res) => {
    const dto = GetCommentsSchema.parse({
      skip: req.query.skip,
      take: req.query.take,
      postId: req.params.postId,
    });
    handleExpress(res, () => commentService.getComments(dto));
  });

  app.post("/:postId/comments/:commentId/like", (req, res) => {
    const dto = LikeCommentSchema.parse(req.body);
    handleExpress(res, () =>
      likeCommentService.createLikeComment(dto, userService, commentService)
    );
  });

  app.post("/:postId/comments/:commentId/unlike", (req, res) => {
    const dto = LikeCommentSchema.parse(req.body);
    handleExpress(res, () =>
      likeCommentService.createLikeComment(dto, userService, commentService)
    );
  });

  return app;
};
