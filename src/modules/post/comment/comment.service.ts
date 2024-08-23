import { NotFound } from "../../../utilities/http-error";
import { IUserRepository } from "../../user/user.repository";
import { UserService } from "../../user/user.service";
import { IPostRepository } from "../post.repository";
import { PostService } from "../post.service";
import { ICommentRepository } from "./comment.repository";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { GetCommentsDto } from "./dto/get-comments.dto";
import { CommentId } from "./model/comment-id";

export class CommentService {
  constructor(private commentRepo: ICommentRepository) {}

  async createComment(
    dto: CreateCommentDto,
    userService: UserService,
    postService: PostService
  ) {
    if ((await postService.getPost(dto.postId, userService)) === null) {
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

    return await this.commentRepo.create({
      userId: dto.userId,
      postId: dto.postId,
      parentId: dto.parentId,
      description: dto.description,
    });
  }

  async getCommentById(commentId: CommentId) {
    return await this.commentRepo.findById(commentId);
  }

  async getComments(dto: GetCommentsDto) {
    return await this.commentRepo.getAll(dto);
  }
}
