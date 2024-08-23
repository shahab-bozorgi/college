import { ICommentRepository } from "./comment.repository";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { GetCommentsDto } from "./dto/get-comments.dto";

export class CommentService {
  constructor(private commentRepo: ICommentRepository) {}

  async createComment(dto: CreateCommentDto) {
    return await this.commentRepo.create({
      userId: dto.userId,
      postId: dto.postId,
      parentId: dto.parentId,
      description: dto.description,
    });
  }

  async getComments(dto: GetCommentsDto) {
    return await this.commentRepo.getAll(dto);
  }
}
