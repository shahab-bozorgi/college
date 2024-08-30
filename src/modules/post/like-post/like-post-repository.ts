import { DataSource, Repository } from "typeorm";
import { UserId } from "../../user/model/user-user-id";
import { PostId } from "../model/post-id";
import { LikePostEntity } from "./entity/like-post-entity";

export interface ILikePostRepository {
  create(userId: UserId, postId: PostId): Promise<LikePostEntity>;
  delete(userId: UserId, postId: PostId): Promise<void>;
  countLikesByPostId(postId: PostId): Promise<number>;
  findLike(userId: UserId, postId: PostId): Promise<LikePostEntity | null>;
}

export class LikePostRepository implements ILikePostRepository {
  private repo: Repository<LikePostEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(LikePostEntity);
  }

  async create(userId: UserId, postId: PostId): Promise<LikePostEntity> {
    const like = this.repo.create({ userId, postId });
    return await this.repo.save(like);
  }



  async findLike(
    userId: UserId,
    postId: PostId
  ): Promise<LikePostEntity | null> {
    return this.repo.findOne({ where: { userId, postId } });
  }

  async delete(userId: UserId, postId: PostId): Promise<void> {
    await this.repo.delete({ userId, postId });
  }

  async countLikesByPostId(postId: PostId): Promise<number> {
    return await this.repo.count({
      where: { postId },
    });
  }
}
