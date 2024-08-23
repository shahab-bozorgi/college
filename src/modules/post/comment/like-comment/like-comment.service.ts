import { LikeCommentDto } from "./dto/like-comment.dto";
import { UnLikeCommentDto } from "./dto/unlike-comment.dto";
import { ILikeCommentRepository } from "./like-comment-repository";

export class LikeCommentService {
  constructor(private likeCommentRepo: ILikeCommentRepository) {}

  async createLikeComment(dto: LikeCommentDto) {
    return await this.likeCommentRepo.create({
      userId: dto.userId,
      commentId: dto.commentId,
    });
  }

  async deleteLikeComment(dto: UnLikeCommentDto) {
    return await this.likeCommentRepo.delete({
      userId: dto.userId,
      commentId: dto.commentId,
    });
  }
}
