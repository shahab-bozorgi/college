import express from "express";
import dotenv from "dotenv-flow";
dotenv.config();
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.route";
import { DataSource } from "typeorm";
import { authMiddleware } from "./middleware/authenticate.middleware";
import { makeAuthRouter } from "./routes/auth.route";
import cors from "cors";
import { swaggerOptions } from "./swagger";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { PasswordResetRepository } from "./modules/password-reset/password-reset.repository";
import { PasswordResetService } from "./modules/password-reset/password-reset.service";
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
import { errorHandler } from "./utilities/error-handler";
import { FollowService } from "./modules/user/follow/follow.service";
import { FollowRepository } from "./modules/user/follow/follow.repository";
import { LikePostService } from "./modules/post/like-post/like-post.service";
import { LikePostRepository } from "./modules/post/like-post/like-post-repository";
import { BookmarkRepository } from "./modules/post/bookmark/bookmark.repository";
import { BookmarkService } from "./modules/post/bookmark/bookmark.service";
import { ExploreRepository } from "./modules/user/explore/explore-repository";
import { ExploreService } from "./modules/user/explore/explore.service";
import { ActionNotificationService } from "./modules/common/service/action-notification.service";
import { ActionNotificationRepository } from "./modules/common/repository/action-notification.repository";
import { makeNotificationRouter } from "./routes/notifications.route";
import { NotificationService } from "./modules/action/notification/notification.service";
import { NotificationRepository } from "./modules/action/notification/notification.repository";
import { MentionRepository } from "./modules/post/mention/mention.repository";
import { MentionService } from "./modules/post/mention/mention.service";

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
  const userService = new UserService(userRepository);
  const followRepository = new FollowRepository(dataSource);
  const followService = new FollowService(followRepository);
  const mentionRepository = new MentionRepository(dataSource);
  const mentionService = new MentionService(
    mentionRepository,
    userService,
    followService
  );
  const postRepository = new PostRepository(dataSource);
  const postService = new PostService(
    postRepository,
    mediaService,
    followService,
    mentionService
  );
  const tagRepository = new TagRepository(dataSource);
  const tagService = new TagService(tagRepository);
  const commentRepository = new CommentRepository(dataSource);
  const commentService = new CommentService(commentRepository);
  const likeCommentRepository = new LikeCommentRepository(dataSource);
  const likeCommentService = new LikeCommentService(likeCommentRepository);
  const likePostRepository = new LikePostRepository(dataSource);
  const likePostService = new LikePostService(likePostRepository);
  const bookmarkRepository = new BookmarkRepository(dataSource);
  const bookmarkService = new BookmarkService(bookmarkRepository);
  const exploreRepository = new ExploreRepository(dataSource);
  const exploreService = new ExploreService(exploreRepository, followService);
  const actionNotificationRepository = new ActionNotificationRepository(
    dataSource
  );
  const actionNotificationService = new ActionNotificationService(
    actionNotificationRepository,
    followService,
    userService
  );
  const notificationRepository = new NotificationRepository(dataSource);
  const notificationService = new NotificationService(
    notificationRepository,
    userService,
    followService,
    postService,
    commentService
  );

  app.use("/auth", makeAuthRouter(userService, passwordResetService));
  app.use(
    "/users",
    authMiddleware(userService),

    makeUserRouter(
      userService,
      followService,
      mediaService,
      postService,
      exploreService,
      mentionService,
      bookmarkService,
      actionNotificationService
    )
  );
  app.use(
    "/posts",
    authMiddleware(userService),
    makePostRouter(
      postService,
      userService,
      tagService,
      commentService,
      likeCommentService,
      likePostService,
      bookmarkService,
      actionNotificationService
    )
  );

  app.use(
    "/notifications",
    authMiddleware(userService),
    makeNotificationRouter(notificationService)
  );

  app.use((req, res) => {
    res.status(404).send({ message: "Not Found!" });
  });

  app.use(errorHandler);

  return app;
};
