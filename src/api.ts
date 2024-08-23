import express, { ErrorRequestHandler } from "express";
import dotenv from "dotenv-flow";
dotenv.config();
import {
  FollowRepository,
  UserRepository,
} from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.route";
import { DataSource } from "typeorm";
import { ZodError } from "zod";
import { authMiddleware } from "./middleware/authenticate.middleware";
import { makeAuthRouter } from "./routes/auth.route";
import cors from "cors";
import { swaggerOptions } from "./swagger";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { PasswordResetRepository } from "./modules/password-reset/password-reset.repository";
import { PasswordResetService } from "./modules/password-reset/password-reset.service";
import { HttpError } from "./utilities/http-error";
import { MediaRepository } from "./modules/media/media.repository";
import { MediaService } from "./modules/media/media.service";
import { PostRepository } from "./modules/post/post.repository";
import { PostService } from "./modules/post/post.service";
import { makePostRouter } from "./routes/post.route";
import { TagRepository } from "./modules/tag/tag.repository";
import { TagService } from "./modules/tag/tag.service";
import { CommentService } from "./modules/post/comment/comment.service";
import { CommentRepository } from "./modules/post/comment/comment.repository";
import { LikeCommentRepository } from "./modules/post/comment/like-comment/like-comment-repository";
import { LikeCommentService } from "./modules/post/comment/like-comment/like-comment.service";

export const makeApp = (dataSource: DataSource) => {
  const app = express();
  const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  };
  app.use(express.json());
  app.use(cors(corsOptions));

  const swaggerDocs = swaggerjsdoc(swaggerOptions);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  app.use("/uploads", express.static("uploads"));

  if (process.env.NODE_ENV !== "test") {
    app.use((req, res, next) => {
      console.log(req.method, req.url);
      next();
    });
  }

  const mediaRepository = new MediaRepository(dataSource);
  const mediaService = new MediaService(mediaRepository);
  const passwordResetRepository = new PasswordResetRepository(dataSource);
  const passwordResetService = new PasswordResetService(
    passwordResetRepository
  );
  const userRepository = new UserRepository(dataSource);
  const followRepository = new FollowRepository(dataSource);
  const userService = new UserService(userRepository, followRepository);
  const postRepository = new PostRepository(dataSource);
  const postService = new PostService(postRepository, mediaService);
  const tagRepository = new TagRepository(dataSource);
  const tagService = new TagService(tagRepository);
  const commentRepository = new CommentRepository(dataSource);
  const commentService = new CommentService(commentRepository);
  const likeCommentRepository = new LikeCommentRepository(dataSource);
  const likeCommentService = new LikeCommentService(likeCommentRepository);

  app.use("/auth", makeAuthRouter(userService, passwordResetService));
  app.use(
    "/users",
    authMiddleware(userService),
    makeUserRouter(userService, mediaService, postService)
  );
  app.use(
    "/posts",
    authMiddleware(userService),
    makePostRouter(postService, userService, tagService, commentService, likeCommentService)
  );

  app.use((req, res) => {
    res.status(404).send({ message: "Not Found!" });
  });

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
      res
        .status(400)
        .json({ ok: false, message: err.errors.map((err) => err.message) });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.code).json({
        ok: false,
        message: [err.message],
      });
      return;
    }

    res.status(500).json({ ok: false, message: ["Internal server error!"] });
  };

  app.use(errorHandler);

  return app;
};
