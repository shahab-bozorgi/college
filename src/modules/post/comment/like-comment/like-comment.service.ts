import { CreateLikeCommentDto } from "./dto/create-like-comment.dto";
import { ILikeCommentRepository } from "./like-comment-repository";

export class LikeCommentService {
  constructor(private likeCommentRepo: ILikeCommentRepository) {}

  async createLikeComment(dto: CreateLikeCommentDto) {
    return await this.likeCommentRepo.create({
      userId: dto.userId,
      commentId: dto.commentId,
    });
  }
}
