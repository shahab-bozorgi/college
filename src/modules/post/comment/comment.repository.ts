import { DataSource, Repository } from "typeorm";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { Comment } from "./model/comment.model";
import { v4 } from "uuid";
import { CommentEntity } from "./entity/comment.entity";
import { GetCommentsDto } from "./dto/get-comments.dto";
import { CommentId } from "./model/comment-id";

export interface ICommentRepository {
  create(comment: CreateCommentDto): Promise<Comment>;
  findById(id: CommentId): Promise<Comment | null>;
  getAll(query: GetCommentsDto): Promise<Comment[] | null>;
}

export class CommentRepository implements ICommentRepository {
  private repo: Repository<CommentEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(CommentEntity);
  }

  async create(comment: CreateCommentDto): Promise<Comment> {
    return await this.repo.save({ id: v4(), ...comment });
  }

  async findById(id: CommentId): Promise<Comment | null> {
    return await this.repo.findOne({
      where: { id },
    });
  }
  async getAll(query: GetCommentsDto): Promise<Comment[] | null> {
    return await this.repo.find({
      where: { postId: query.postId },
      order: { createdAt: "DESC" },
      take: query.take,
      skip: (query.page - 1) * query.take,
    });
  }
}
