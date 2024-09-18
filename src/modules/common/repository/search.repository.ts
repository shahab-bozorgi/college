import { Brackets, DataSource } from "typeorm";
import {
  PaginatedResult,
  PaginationDto,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";
import { User } from "../../user/model/user.model";
import {
  SearchTagPost,
  SearchSuggestionTag,
  SearchUser,
  SearchSuggestionUser,
} from "../service/search.service";
import { UserEntity } from "../../user/entity/user.entity";
import {
  BLOCKED,
  FOLLOWING,
  NOT_FOLLOWING,
} from "../../user/follow/model/follow.model";
import { NoneEmptyString } from "../../../data/non-empty-string";
import { PositiveInt } from "../../../data/int";
import { TagEntity } from "../../tag/tag.entity";
import { FollowEntity } from "../../user/follow/entity/follow.entity";

export interface ISearchRepository {
  suggestUsers(
    authenticatedUser: User,
    searchQuery: NoneEmptyString,
    count: PositiveInt
  ): Promise<SearchSuggestionUser[]>;
  findUsers(
    authenticatedUser: User,
    searchQuery: string,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ users: SearchUser[] }>>;
  suggestTags(
    searchQuery: string,
    count: PositiveInt
  ): Promise<SearchSuggestionTag[]>;
  findTagPosts(
    authenticatedUser: User,
    searchQuery: string,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ posts: SearchTagPost[] }>>;
}

export class SearchRepository implements ISearchRepository {
  constructor(private dataSource: DataSource) {}

  async suggestUsers(
    authenticatedUser: User,
    searchQuery: NoneEmptyString,
    count: PositiveInt
  ): Promise<SearchSuggestionUser[]> {
    const result = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder("user")
      .select(["user.id", "user.username", "user.firstName", "user.lastName"])
      .leftJoinAndSelect("user.avatar", "avatar")
      .leftJoinAndSelect("user.followings", "following")
      .leftJoin("user.followers", "follower")
      .where("user.id != :userId", { userId: authenticatedUser.id })
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("user.username LIKE :query", { query: `%${searchQuery}%` })
            .orWhere("user.firstName LIKE :query", {
              query: `%${searchQuery}%`,
            })
            .orWhere("user.lastName LIKE :query", {
              query: `%${searchQuery}%`,
            })
        )
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("follower.followerId != :userId", {
              userId: authenticatedUser.id,
            })
            .orWhere(
              "follower.followerId IS NULL OR (follower.followerId = :userId AND follower.followingStatus != :blocked)",
              { userId: authenticatedUser.id, blocked: BLOCKED }
            )
        )
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("following.followingId != :userId", {
              userId: authenticatedUser.id,
            })
            .orWhere(
              "following.followingId IS NULL OR (following.followingId = :userId AND following.followingStatus != :blocked)",
              { userId: authenticatedUser.id, blocked: BLOCKED }
            )
        )
      )
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(followers.id)", "count")
          .from(FollowEntity, "followers")
          .where("followers.followingId = user.id")
          .andWhere("followers.followingStatus = :following", {
            following: FOLLOWING,
          });
      }, "followersCount")
      .orderBy("followersCount", "DESC")
      .take(count)
      .getMany();

    return result.map((rs) => {
      return {
        firstName: rs.firstName,
        lastName: rs.lastName,
        username: rs.username,
        avatar: rs.avatar,
        isCloseFriend: rs.followings.some(
          (following) =>
            following.followingId === authenticatedUser.id &&
            following.isCloseFriend
        ),
      };
    });
  }

  async findUsers(
    authenticatedUser: User,
    searchQuery: NoneEmptyString,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ users: SearchUser[] }>> {
    const result = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder("user")
      .select(["user.id", "user.username", "user.firstName", "user.lastName"])
      .leftJoinAndSelect("user.avatar", "avatar")
      .leftJoinAndSelect("user.followings", "following")
      .leftJoinAndSelect("user.followers", "follower")
      .where("user.id != :userId", { userId: authenticatedUser.id })
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("user.username LIKE :query", { query: `%${searchQuery}%` })
            .orWhere("user.firstName LIKE :query", {
              query: `%${searchQuery}%`,
            })
            .orWhere("user.lastName LIKE :query", {
              query: `%${searchQuery}%`,
            })
        )
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("follower.followerId != :userId", {
              userId: authenticatedUser.id,
            })
            .orWhere(
              "follower.followerId IS NULL OR (follower.followerId = :userId AND follower.followingStatus != :blocked)",
              { userId: authenticatedUser.id, blocked: BLOCKED }
            )
        )
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("following.followingId != :userId", {
              userId: authenticatedUser.id,
            })
            .orWhere(
              "following.followingId IS NULL OR (following.followingId = :userId AND following.followingStatus != :blocked)",
              { userId: authenticatedUser.id, blocked: BLOCKED }
            )
        )
      )
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(followers.id)", "count")
          .from(FollowEntity, "followers")
          .where("followers.followingId = user.id")
          .andWhere("followers.followingStatus = :following", {
            following: FOLLOWING,
          });
      }, "followersCount")
      .orderBy("followersCount", "DESC")
      .skip(paginationSkip(pagination))
      .take(pagination.limit)
      .getManyAndCount();

    const { nextPage, totalPages } = paginationInfo(result[1], pagination);
    return {
      users: result[0].map((rs) => {
        const status = rs.followers.find(
          (follower) => follower.followerId === authenticatedUser.id
        );
        return {
          id: rs.id,
          firstName: rs.firstName,
          lastName: rs.lastName,
          username: rs.username,
          avatar: rs.avatar,
          followersCount: rs.followers.length,
          followingStatus: status ? status.followingStatus : NOT_FOLLOWING,
          isCloseFriend: rs.followings.some(
            (following) =>
              following.followingId === authenticatedUser.id &&
              following.isCloseFriend
          ),
        };
      }),
      nextPage,
      totalPages,
    };
  }

  async suggestTags(
    searchQuery: string,
    count: PositiveInt
  ): Promise<SearchSuggestionTag[]> {
    const result = await this.dataSource
      .getRepository(TagEntity)
      .createQueryBuilder("tag")
      .where("tag.title LIKE :query", { query: `%${searchQuery}%` })
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(post_tag.postsId)")
          .from("posts_tags_tags", "post_tag")
          .where("post_tag.tagsId = tag.id");
      }, "postsCount")
      .orderBy("postsCount", "DESC")
      .take(count)
      .getMany();

    return result.map((tag) => tag.title);
  }

  async findTagPosts(
    authenticatedUser: User,
    searchQuery: string,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ posts: SearchTagPost[] }>> {
    const result = await this.dataSource
      .getRepository(TagEntity)
      .createQueryBuilder("tag")
      .where("tag.title LIKE :query", { query: `%${searchQuery}%` })
      .leftJoinAndSelect("tag.posts", "post")
      .leftJoinAndSelect("post.media", "media")
      .leftJoin("post.author", "author")
      .leftJoin("author.followings", "following")
      .leftJoin("author.followers", "follower")
      .andWhere((qb) =>
        qb
          .where("follower.followerId != :userId", {
            userId: authenticatedUser.id,
          })
          .orWhere(
            "follower.followerId = :userId AND follower.followingStatus != :blocked",
            { userId: authenticatedUser.id, blocked: BLOCKED }
          )
      )
      // .andWhere((qb) =>
      //   qb
      //     .where("following.followingId != :userId", {
      //       userId: authenticatedUser.id,
      //     })
      //     .orWhere(
      //       "following.followingId = :userId AND following.followingStatus != :blocked",
      //       { userId: authenticatedUser.id, status: BLOCKED }
      //     )
      // )
      // .andWhere((qb) =>
      //   qb
      //     .where("post.closeFriendsOnly = 0")
      //     .orWhere("post.closeFriendsOnly = 1 AND post.authorId = :userId", {
      //       userId: authenticatedUser.id,
      //     })
      //     .orWhere(
      //       `post.closeFriendsOnly = 1 AND\
      //        EXISTS(SELECT * FROM follower WHERE follower.followerId = :userId\
      //         AND isCloseFriend = 1)`
      //     )
      // )
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(like.postId)")
          .from("like_posts", "like")
          .where("like.postId = post.id");
      }, "likesCount")
      .orderBy("likesCount", "DESC")
      .skip(paginationSkip(pagination))
      .take(pagination.limit)
      .getManyAndCount();

    const { nextPage, totalPages } = paginationInfo(result[1], pagination);
    return {
      posts: result[0].reduce((posts: SearchTagPost[], tag) => {
        return posts.concat(
          tag.posts.map((post) => {
            return {
              id: post.id,
              media: post.media,
              closeFriendsOnly: post.closeFriendsOnly,
            };
          })
        );
      }, []),
      nextPage,
      totalPages,
    };
  }
}
