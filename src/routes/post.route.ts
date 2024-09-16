import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { CreatePostSchema } from "../modules/post/dto/create-post.dto";
import { MBToBytes, uploadMultipleFiles } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { imageMIMEs } from "../modules/media/model/mime";
import { UserService } from "../modules/user/user.service";
import { TagService } from "../modules/tag/tag.service";
import { UpdatePostSchema } from "../modules/post/dto/update-post.dto";
import { PostId } from "../modules/post/model/post-id";
import { CommentService } from "../modules/post/comment/comment.service";
import { LikeCommentService } from "../modules/post/comment/like-comment/like-comment.service";
import { LikeCommentSchema } from "../modules/post/comment/like-comment/dto/like-comment.dto";
import { GetCommentsSchema } from "../modules/post/comment/dto/get-comments.dto";
import { CreateCommentSchema } from "../modules/post/comment/dto/create-comment.dto";
import { parseDtoWithSchema } from "../utilities/parse-dto-handler";
import { CreateBookmarkSchema } from "../modules/post/bookmark/dto/create-bookmark.dto";
import { BookmarkService } from "../modules/post/bookmark/bookmark.service";
import { getPostsSchema } from "../modules/post/dto/get-posts.dto";
import { LikePostSchema } from "../modules/post/like-post/dto/like-post-dto";
import { LikePostService } from "../modules/post/like-post/like-post.service";
import { ActionNotificationService } from "../modules/common/service/action-notification.service";
import { expressHandler } from "../utilities/handle-express";

export const makePostRouter = (
  postService: PostService,
  userService: UserService,
  tagService: TagService,
  commentService: CommentService,
  likeCommentService: LikeCommentService,
  likePostService: LikePostService,
  bookmarkService: BookmarkService,
  actionNotificationService: ActionNotificationService
) => {
  const app = Router();
  const uploadPath = "/posts";

  app.get("/", async (req, res, next) => {
    try {
      const { username, page, limit } = getPostsSchema.parse({
        username: req.query.username ?? req.user.username,
        page: req.query.page,
        limit: req.query.limit,
      });
      const data = res.status(200).json({
        ok: true,
        data: await postService.getPosts(
          username,
          req.user,
          { page, limit },
          userService
        ),
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
        await postService.create(req.user, req.files, dto, tagService);
        res.status(201).json({ ok: true, data: {} });
      } catch (e) {
        next(e);
      }
    }
  );

  app.get("/:id", (req, res) => {
    expressHandler(req, res, () =>
      postService.getPost(req.params.id, req.user, userService)
    );
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
          tagService,
          Array.isArray(req.files) ? req.files : undefined
        );
        res.status(200).json({ ok: true, data: {} });
      } catch (e) {
        next(e);
      }
    }
  );

  app.post("/:postId/comments", (req, res) => {
    const dto = parseDtoWithSchema(
      {
        userId: req.user.id,
        postId: req.params.postId,
        parentId: req.body.parentId,
        description: req.body.description,
      },
      CreateCommentSchema
    );

    expressHandler(req, res, () =>
      commentService.createComment(
        dto,
        userService,
        postService,
        actionNotificationService
      )
    );
  });

  app.get("/:postId/comments", (req, res) => {
    const dto = parseDtoWithSchema(
      {
        authenticatedUserId: req.user.id,
        postId: req.params.postId,
        page: req.query.page,
        limit: req.query.limit,
      },
      GetCommentsSchema
    );

    expressHandler(req, res, () =>
      commentService.getComments(dto, likeCommentService, postService)
    );
  });

  app.post("/:postId/comments/:commentId/like", (req, res) => {
    const dto = parseDtoWithSchema(
      {
        userId: req.user.id,
        commentId: req.params.commentId,
      },
      LikeCommentSchema
    );

    expressHandler(req, res, () =>
      likeCommentService.createLikeComment(dto, userService, commentService)
    );
  });

  app.delete("/:postId/comments/:commentId/unlike", (req, res) => {
    const dto = parseDtoWithSchema(
      {
        userId: req.user.id,
        commentId: req.params.commentId,
      },
      LikeCommentSchema
    );

    expressHandler(req, res, () =>
      likeCommentService.deleteLikeComment(dto, userService, commentService)
    );
  });

  app.post("/:postId/like", (req, res) => {
    const dto = parseDtoWithSchema(
      {
        userId: req.user.id,
        postId: req.params.postId,
      },
      LikePostSchema
    );

    expressHandler(req, res, async () => {
      await likePostService.likePost(dto, userService, postService);
      return {};
    });
  });

  app.delete("/:postId/unlike", (req, res) => {
    const dto = parseDtoWithSchema(
      {
        userId: req.user.id,
        postId: req.params.postId,
      },
      LikePostSchema
    );

    expressHandler(req, res, () =>
      likePostService.unLikePost(dto, userService, postService)
    );
  });

  app.post("/:postId/bookmark", async (req, res, next) => {
    try {
      const dto = parseDtoWithSchema(
        {
          userId: req.user.id,
          postId: req.params.postId,
        },
        CreateBookmarkSchema
      );
      await bookmarkService.createBookmark(dto, userService, postService);
      res.status(201).json({ ok: true, data: {} });
    } catch (e) {
      next(e);
    }
  });

  app.delete("/:postId/unbookmark", async (req, res, next) => {
    try {
      const dto = parseDtoWithSchema(
        {
          userId: req.user.id,
          postId: req.params.postId,
        },
        CreateBookmarkSchema
      );
      await bookmarkService.deleteBookmark(dto, userService, postService);
      res.status(201).json({ ok: true, data: {} });
    } catch (e) {
      next(e);
    }
  });

  return app;
};
