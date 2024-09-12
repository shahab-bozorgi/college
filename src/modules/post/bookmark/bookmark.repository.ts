import { DataSource, Repository } from "typeorm";
import { BookmarkEntity } from "./entity/bookmark.entity";
import {
  Bookmark,
  CreateBookmark,
  DeleteBookmark,
} from "./model/bookmark.model";
import { UserId } from "../../user/model/user-user-id";
import {
  PaginatedResult,
  PaginationDto,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";
import { ShowPosts } from "../model/post.model";

export interface IBookmarkRepository {
  create(bookmark: CreateBookmark): Promise<Bookmark>;
  delete(bookmark: DeleteBookmark): Promise<boolean>;
  userBookmarks(
    userId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<ShowPosts>>;
}

export class BookmarkRepository implements IBookmarkRepository {
  private repo: Repository<BookmarkEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(BookmarkEntity);
  }

  async create(bookmark: CreateBookmark): Promise<Bookmark> {
    return await this.repo.save(bookmark);
  }

  async delete(bookmark: DeleteBookmark): Promise<boolean> {
    return Boolean((await this.repo.delete(bookmark)).affected);
  }

  async userBookmarks(
    userId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<ShowPosts>> {
    const result = await this.repo
      .createQueryBuilder("bookmark")
      .leftJoinAndSelect("bookmark.post", "post")
      .leftJoinAndSelect("post.media", "media")
      .where("bookmark.userId=:userId", { userId })
      .andWhere(
        `(post.closeFriendsOnly=0 OR post.closeFriendsOnly =\
         Exists(Select * from follows where\
         follows.followingId=post.authorId AND\
          follows.followerId=:userId AND follows.isCloseFriend=1))`,
        { userId }
      )
      .orderBy("bookmark.createdAt", "DESC")
      .skip(paginationSkip(pagination))
      .take(pagination.limit)
      .getManyAndCount();
    const { nextPage, totalPages } = paginationInfo(result[1], pagination);
    return {
      posts: result[0].map((bookmark) => bookmark.post),
      nextPage,
      totalPages,
    };
  }
}
