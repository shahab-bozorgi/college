import { PaginatedResult, paginationInfo } from "../../../data/pagination";
import { NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { ActionNotificationService } from "../../common/service/action-notification.service";
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

    if (dto.parentId !== null) {
      if ((await this.commentRepo.findById(dto.parentId)) === null) {
        throw new NotFound("Parent Comment is not found");
      }
    }

    const commentCreated = await this.commentRepo.create({
      userId: dto.userId,
      postId: dto.postId,
      parentId: dto.parentId,
      description: dto.description,
    });

    let mediaId = null;
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

        parentComments.push({
          ...comment,
          isLiked,
          replies: this.buildCommentTree(comment, comments),
        });
      }
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

  private buildCommentTree(
    parentComment: ShowComment,
    allComments: ShowComment[]
  ): ShowComment[] {
    const children = allComments.filter(
      (child) => child.parentId === parentComment.id
    );
    
    const replies = children.map((child) => ({
      ...child,
      replies: this.buildCommentTree(child, allComments),
    }));

    return replies;
  }
}
