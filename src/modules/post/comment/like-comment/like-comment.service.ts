import { DuplicatedRecord, NotFound } from "../../../../utilities/http-error";
import { UserId } from "../../../user/model/user-user-id";
import { UserService } from "../../../user/user.service";
import { CommentService } from "../comment.service";
import { CommentId } from "../model/comment-id";
import { LikeCommentDto } from "./dto/like-comment.dto";
import { UnLikeCommentDto } from "./dto/unlike-comment.dto";
import { ILikeCommentRepository } from "./like-comment-repository";
import { GetLikeComment, LikeComment } from "./model/like-comment.model";

export class LikeCommentService {
  constructor(private likeCommentRepo: ILikeCommentRepository) {}

  async createLikeComment(
    dto: LikeCommentDto,
    userService: UserService,
    commentService: CommentService
  ) {
    if (
      (await this.likeCommentRepo.getLikeComment({
        userId: dto.userId,
        commentId: dto.commentId,
      })) !== null
    ) {
      throw new DuplicatedRecord("This comment liked by this user");
    }

    if ((await commentService.getCommentById(dto.commentId)) === null) {
      throw new NotFound("Comment is not found");
    }

    if ((await userService.getUserBy(dto.userId)) === null) {
      throw new NotFound("User is not found");
    }

    return await this.likeCommentRepo.create({
      userId: dto.userId,
      commentId: dto.commentId,
    });
  }

  async deleteLikeComment(
    dto: UnLikeCommentDto,
    userService: UserService,
    commentService: CommentService
  ) {
    if (
      (await this.likeCommentRepo.getLikeComment({
        userId: dto.userId,
        commentId: dto.commentId,
      })) === null
    ) {
      throw new NotFound("This comment did not like by this user");
    }

    if ((await commentService.getCommentById(dto.commentId)) === null) {
      throw new NotFound("Comment is not found");
    }

    if ((await userService.getUserBy(dto.userId)) === null) {
      throw new NotFound("User is not found");
    }

    return await this.likeCommentRepo.delete({
      userId: dto.userId,
      commentId: dto.commentId,
    });
  }

  async getLikeComment(dto: GetLikeComment): Promise<LikeComment | null> {
    return await this.likeCommentRepo.getLikeComment({
      userId: dto.userId,
      commentId: dto.commentId,
    });
  }
}
