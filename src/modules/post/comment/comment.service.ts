import { PaginatedResult, paginationInfo } from "../../../data/pagination";
import { NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { ActionNotificationService } from "../../common/service/action-notification.service";
import { MediaId } from "../../media/model/media-id";
import { UserService } from "../../user/user.service";
import { PostService } from "../post.service";
import { ICommentRepository } from "./comment.repository";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { GetCommentsDto } from "./dto/get-comments.dto";
import { LikeCommentService } from "./like-comment/like-comment.service";
import { CommentId } from "./model/comment-id";
import { ShowComment } from "./model/comment.model";

export class CommentService {
  constructor(private commentRepo: ICommentRepository) {}

  async createComment(
    dto: CreateCommentDto,
    userService: UserService,
    postService: PostService,
    actionNotificationService: ActionNotificationService
  ) {
    const postOfComment = await postService.findPostById(dto.postId, ["media"]);

    if (postOfComment === null) {
      throw new NotFound("Post is not found");
    }

    if ((await userService.getUserBy(dto.userId)) === null) {
      throw new NotFound("User is not found");
    }

    let rootParentId = null;

    if (dto.parentId !== null && dto.parentId !== undefined) {
      const parentOfComment = await this.commentRepo.findById(dto.parentId);
      if (parentOfComment === null) {
        throw new NotFound("Parent Comment is not found");
      }

      if (parentOfComment.rootParentId !== null) {
        rootParentId = parentOfComment.rootParentId;
      } else {
        rootParentId = dto.parentId === undefined ? null : dto.parentId;
      }
    }

    const commentCreated = await this.commentRepo.create(
      {
        userId: dto.userId,
        postId: dto.postId,
        parentId: dto.parentId,
        description: dto.description,
      },
      rootParentId
    );

    let mediaId: MediaId | null = null;
    if (postOfComment.media.length > 0) {
      mediaId = postOfComment.media[0].id;
    }

    const actionDto: CreateActionDto = {
      actorId: commentCreated.userId,
      type: "comment",
      entityId: commentCreated.id,
      actionDate: commentCreated.createdAt,
      mediaId: mediaId,
    };

    await actionNotificationService.createActionWithNotifications(
      actionDto,
      postOfComment.authorId,
      postOfComment.closeFriendsOnly
    );

    return commentCreated;
  }

  async getCommentById(commentId: CommentId) {
    return await this.commentRepo.findById(commentId);
  }

  async getComments(
    dto: GetCommentsDto,
    likeCommentService: LikeCommentService,
    postService: PostService
  ): Promise<PaginatedResult<{ comments: ShowComment[] }>> {
    if ((await postService.findPostById(dto.postId)) === null) {
      throw new NotFound("Post is not found");
    }

    const comments = await this.commentRepo.getAll(dto);

    let parentComments: ShowComment[] = [];
    let childComments: ShowComment[] = [];

    if (comments !== null) {
      for (const comment of comments) {
        const isLiked =
          (await likeCommentService.getLikeComment({
            userId: dto.authenticatedUserId,
            commentId: comment.id,
          })) !== null
            ? true
            : false;

        if (comment.rootParentId === null) {
          parentComments.push({ ...comment, isLiked });
        }
      }

      for (const comment of comments) {
        const isLiked =
          (await likeCommentService.getLikeComment({
            userId: dto.authenticatedUserId,
            commentId: comment.id,
          })) !== null
            ? true
            : false;

        if (comment.rootParentId !== null) {
          childComments.push({ ...comment, isLiked });
        }
      }

      parentComments.forEach((parent) => {
        parent.replies = childComments.filter(
          (child) => child.rootParentId === parent.id
        );
      });

      const orphans = childComments.filter(
        (child) => !comments.some((parent) => parent.id === child.rootParentId)
      );

      orphans.forEach(async (orph) => {
        parentComments.push({
          ...orph,
          isLiked:
            (await likeCommentService.getLikeComment({
              userId: dto.authenticatedUserId,
              commentId: orph.id,
            })) !== null
              ? true
              : false,
          replies: [],
        });
      });
    }

    const { nextPage, totalPages } = paginationInfo(
      await this.commentRepo.countComments(dto.postId),
      {
        page: dto.page,
        limit: dto.limit,
      }
    );

    return {
      comments: parentComments,
      nextPage,
      totalPages,
    };
  }
}
