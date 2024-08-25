import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { CreatePostSchema } from "../modules/post/dto/create-post.dto";
import { MBToBytes, uploadMultipleFiles } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { imageMIMEs } from "../modules/media/field-types/mime";
import { UserService } from "../modules/user/user.service";
import { TagService } from "../modules/tag/tag.service";
import { UpdatePostSchema } from "../modules/post/dto/update-post.dto";
import { PostId } from "../modules/post/model/post-id";
import { CommentService } from "../modules/post/comment/comment.service";
import { LikeCommentService } from "../modules/post/comment/like-comment/like-comment.service";
import { handleExpress } from "../utilities/handle-express";
import { Username } from "../modules/user/model/user-username";
import { LikeCommentSchema } from "../modules/post/comment/like-comment/dto/like-comment.dto";
import { GetCommentsSchema } from "../modules/post/comment/dto/get-comments.dto";
import { CreateCommentSchema } from "../modules/post/comment/dto/create-comment.dto";
import { NotFound } from "../utilities/http-error";
import { paginationSchema } from "../data/pagination";

export const makePostRouter = (
  postService: PostService,
  userService: UserService,
  tagService: TagService,
  commentService: CommentService,
  likeCommentService: LikeCommentService
) => {
  const app = Router();
  const uploadPath = "/posts";

  app.get("/", async (req, res, next) => {
    try {
      const author = await userService.getUserBy(
        (req.query.username as Username) ?? req.user.username
      );
      if (!author) throw new NotFound("User not found");
      const pagination = paginationSchema.parse({ ...req.query });
      const page = pagination.page || 1;
      const limit = pagination.limit || 9;
      const skip = (page - 1) * limit;
      const posts = await postService.getPosts(author, skip, limit);
      const nextPage = `${req.baseUrl}?page=${page + 1}&limit=${limit}`;
      res.status(200).json({
        ok: true,
        data: {
          posts,
          nextPage: posts.length ? `${process.env.API_URL}${nextPage}` : "",
        },
      });
    } catch (e) {
      next(e);
    }
  });

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
      postId: req.params.postId,
      page: req.query.page,
      take: req.query.limit,
      baseUrl: req.baseUrl,
    });
    handleExpress(res, () => commentService.getComments(dto));
  });

  app.post("/:postId/comments/:commentId/like", (req, res) => {
    const dto = LikeCommentSchema.parse(req.body);
    handleExpress(res, () =>
      likeCommentService.createLikeComment(dto, userService, commentService)
    );
  });

  app.delete("/:postId/comments/:commentId/unlike", (req, res) => {
    const dto = LikeCommentSchema.parse(req.body);
    handleExpress(res, () =>
      likeCommentService.createLikeComment(dto, userService, commentService)
    );
  });

  return app;
};
