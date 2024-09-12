import { DataSource, Repository } from "typeorm";
import { CreateMention, DeleteMention, Mention } from "./model/mention.model";
import { MentionEntity } from "./entity/mention.entity";
import { UserId } from "../../user/model/user-user-id";
import {
  PaginatedResult,
  PaginationDto,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";
import { ShowPosts } from "../model/post.model";

export interface IMentionRepository {
  insert(mentino: CreateMention[]): Promise<Mention[]>;
  delete(mention: DeleteMention[]): Promise<boolean>;
  postsMentioningUser(
    userId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<ShowPosts>>;
}

export class MentionRepository implements IMentionRepository {
  private repo: Repository<MentionEntity>;
  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(MentionEntity);
  }

  async insert(mention: CreateMention[]): Promise<Mention[]> {
    return await this.repo.save(mention);
  }

  async delete(mention: DeleteMention[]): Promise<boolean> {
    return Boolean(
      (
        await this.repo
          .createQueryBuilder()
          .delete()
          .whereInIds(mention)
          .execute()
      ).affected
    );
  }

  async postsMentioningUser(
    userId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<ShowPosts>> {
    const result = await this.repo
      .createQueryBuilder("mention")
      .leftJoinAndSelect("mention.post", "post")
      .leftJoinAndSelect("post.media", "media")
      .where("mention.userId=:userId", { userId })
      .andWhere(
        `(post.closeFriendsOnly=0 OR post.closeFriendsOnly =\
         Exists(Select * from follows where\
         follows.followingId=post.authorId AND\
          follows.followerId=:userId AND follows.isCloseFriend=1))`,
        { userId }
      )
      .orderBy("mention.createdAt", "DESC")
      .skip(paginationSkip(pagination))
      .take(pagination.limit)
      .getManyAndCount();
    const { nextPage, totalPages } = paginationInfo(result[1], pagination);
    return {
      posts: result[0].map((mention) => mention.post),
      nextPage,
      totalPages,
    };
  }
}
