import { DataSource, Repository } from "typeorm";
import { CreateLikeComment, LikeComment } from "./model/like-comment.model";
import { LikeCommentEntity } from "./entity/like-comment.entity";
import { v4 } from "uuid";

export interface ILikeCommentRepository {
  create(likeComment: CreateLikeComment): Promise<LikeComment>;
}

export class LikeCommentRepository implements ILikeCommentRepository {
  private repo: Repository<LikeCommentEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(LikeCommentEntity);
  }

  async create(likeComment: CreateLikeComment): Promise<LikeComment> {
    return await this.repo.save({ id: v4(), ...likeComment });
  }
}
