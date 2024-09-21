import { Brackets, DataSource, Not, Repository } from "typeorm";
import { UserId } from "../model/user-user-id";
import { FollowEntity } from "./entity/follow.entity";
import {
  BLOCKED,
  CreateFollow,
  DbFollowingStatus,
  DeleteFollow,
  Follow,
  FollowersList,
  FOLLOWING,
  FollowingsList,
  FollowNotification,
  NOT_FOLLOWING,
  UpdateFollow,
} from "./model/follow.model";
import {
  PaginatedResult,
  PaginationDto,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";
import { Blacklist } from "./model/blacklist.model";
import { CloseFriends } from "./model/close-friend.model";
import { FollowId } from "./model/follow-id.model";
import { User } from "../model/user.model";
import { NotFound } from "../../../utilities/http-error";
import { BookmarkEntity } from "../../post/bookmark/entity/bookmark.entity";
import { MentionEntity } from "../../post/mention/entity/mention.entity";

export interface IFollowRepository {
  userFollowings(
    authenticatedUser: User,
    followerId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowingsList>>;
  userFollowers(
    authenticatedUser: User,
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowersList>>;
  userBlacklist(
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<Blacklist>>;
  userCloseFriends(
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<CloseFriends>>;
  findFollowers(
    followingId: UserId,
    followingStatus: DbFollowingStatus,
    relations?: string[]
  ): Promise<Follow[]>;
  findFollowings(
    followerId: UserId,
    followingStatus: DbFollowingStatus,
    relations?: string[]
  ): Promise<Follow[]>;
  countFollowings(followerId: UserId): Promise<number>;
  countFollowers(followingId: UserId): Promise<number>;
  delete(follow: DeleteFollow): Promise<boolean>;
  update(follow: UpdateFollow): Promise<Follow>;
  create(follow: CreateFollow): Promise<Follow>;
  findByFollowerAndFollowing(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null>;
  findById(id: FollowId): Promise<Follow | null>;
  getFollowForNotificationById(
    id: FollowId,
    followerId: UserId
  ): Promise<FollowNotification | null>;
  blockUser(authenticatedUser: User, blockedUser: User): Promise<void>;
}

export class FollowRepository implements IFollowRepository {
  private flwrepo: Repository<FollowEntity>;

  constructor(private dataSource: DataSource) {
    this.flwrepo = this.dataSource.getRepository(FollowEntity);
  }

  async findFollowers(
    followingId: UserId,
    followingStatus: DbFollowingStatus,
    relations?: string[]
  ): Promise<Follow[]> {
    return await this.flwrepo.find({
      where: {
        followingId,
        followingStatus,
      },
      relations,
    });
  }

  async findFollowings(
    followerId: UserId,
    followingStatus: DbFollowingStatus,
    relations?: string[]
  ): Promise<Follow[]> {
    return await this.flwrepo.find({
      where: {
        followerId,
        followingStatus,
      },
      relations,
    });
  }

  async countFollowers(followingId: UserId): Promise<number> {
    return this.flwrepo.count({
      where: { followingId, followingStatus: FOLLOWING },
    });
  }

  async countFollowings(followerId: UserId): Promise<number> {
    return this.flwrepo.count({
      where: { followerId, followingStatus: FOLLOWING },
    });
  }

  async findByFollowerAndFollowing(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null> {
    return this.flwrepo.findOne({
      where: {
        followerId: followerId,
        followingId: followingId,
      },
    });
  }
  async userFollowers(
    authenticatedUser: User,
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowersList>> {
    const result = await this.flwrepo.findAndCount({
      where: { followingId, followingStatus: FOLLOWING },
      relations: {
        follower: { avatar: true, followers: true, followings: true },
      },
      skip: paginationSkip(pagination),
      take: pagination.limit,
    });
    const { nextPage, totalPages } = paginationInfo(result[1], pagination);

    return {
      followers: result[0].map((rs) => {
        return {
          id: rs.follower.id,
          firstName: rs.follower.firstName,
          lastName: rs.follower.lastName,
          username: rs.follower.username,
          avatar: rs.follower.avatar,
          followersCount: rs.follower.followers.filter(
            (follower) => follower.followingStatus === FOLLOWING
          ).length,
          isCloseFriend: rs.follower.followings.some(
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

  async userFollowings(
    authenticatedUser: User,
    followerId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowingsList>> {
    const result = await this.flwrepo.findAndCount({
      where: { followerId, followingStatus: FOLLOWING },
      relations: {
        following: { avatar: true, followers: true, followings: true },
      },
      skip: paginationSkip(pagination),
      take: pagination.limit,
    });
    const { nextPage, totalPages } = paginationInfo(result[1], pagination);

    return {
      followings: result[0].map((rs) => {
        return {
          id: rs.following.id,
          firstName: rs.following.firstName,
          lastName: rs.following.lastName,
          username: rs.following.username,
          avatar: rs.following.avatar,
          followersCount: rs.following.followers.filter(
            (follower) => follower.followingStatus === FOLLOWING
          ).length,
          isCloseFriend: rs.following.followings.some(
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

  async userBlacklist(
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<Blacklist>> {
    const result = await this.flwrepo.findAndCount({
      where: { followingId, followingStatus: BLOCKED },
      relations: { follower: { avatar: true, followers: true } },
      skip: paginationSkip(pagination),
      take: pagination.limit,
    });
    const { nextPage, totalPages } = paginationInfo(result[1], pagination);

    return {
      users: result[0].map((rs) => {
        return {
          id: rs.follower.id,
          firstName: rs.follower.firstName,
          lastName: rs.follower.lastName,
          username: rs.follower.username,
          avatar: rs.follower.avatar,
          followersCount: rs.follower.followers.filter(
            (follower) => follower.followingStatus === FOLLOWING
          ).length,
        };
      }),
      nextPage,
      totalPages,
    };
  }

  async userCloseFriends(
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<CloseFriends>> {
    const result = await this.flwrepo.findAndCount({
      where: { followingId, followingStatus: FOLLOWING, isCloseFriend: true },
      relations: { follower: { avatar: true, followers: true } },
      skip: paginationSkip(pagination),
      take: pagination.limit,
    });
    const { nextPage, totalPages } = paginationInfo(result[1], pagination);

    return {
      users: result[0].map((rs) => {
        return {
          id: rs.follower.id,
          firstName: rs.follower.firstName,
          lastName: rs.follower.lastName,
          username: rs.follower.username,
          avatar: rs.follower.avatar,
          followersCount: rs.follower.followers.filter(
            (follower) => follower.followingStatus === FOLLOWING
          ).length,
        };
      }),
      nextPage,
      totalPages,
    };
  }

  async create(follow: CreateFollow): Promise<Follow> {
    return await this.flwrepo.save({ ...follow });
  }

  async delete(follow: DeleteFollow): Promise<boolean> {
    return Boolean(await this.flwrepo.delete(follow));
  }

  async update(follow: UpdateFollow): Promise<Follow> {
    return await this.flwrepo.save(follow);
  }

  async findById(id: FollowId): Promise<Follow | null> {
    return await this.flwrepo.findOneBy({ id });
  }

  async getFollowForNotificationById(
    id: FollowId,
    followerId: UserId
  ): Promise<FollowNotification | null> {
    const followRow = await this.flwrepo.findOne({
      where: { id },
      relations: ["following"],
      select: {
        following: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    });

    if (followRow === null) {
      return null;
    }

    const followedRecord = await this.findByFollowerAndFollowing(
      followRow.following.id,
      followerId
    );

    const followedStatus = followedRecord?.followingStatus ?? "NotFollowing";

    const followingRecord = await this.findByFollowerAndFollowing(
      followerId,
      followRow.following.id
    );

    const followingStatus = followingRecord?.followingStatus ?? "NotFollowing";

    return {
      following: {
        ...followRow.following,
        followingStatus: followingStatus,
        followedStatus: followedStatus,
      },
    };
  }

  async blockUser(authenticatedUser: User, blockedUser: User): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      const followRepo = manager.getRepository(FollowEntity);
      const authenticatedStatus = await followRepo.findOne({
        where: {
          followingId: authenticatedUser.id,
          followerId: blockedUser.id,
        },
      });
      await followRepo.upsert(
        {
          ...authenticatedStatus,
          followingId: authenticatedUser.id,
          followerId: blockedUser.id,
          followingStatus: BLOCKED,
          isCloseFriend: false,
        },
        { conflictPaths: { id: true } }
      );
      await followRepo.delete({
        followingId: blockedUser.id,
        followerId: authenticatedUser.id,
        followingStatus: Not(BLOCKED),
      });
      await manager
        .getRepository(BookmarkEntity)
        .createQueryBuilder()
        .delete()
        .where(
          new Brackets((qb) =>
            qb
              .where("userId = :authenticatedId")
              .andWhere(
                "postId IN (SELECT id FROM posts WHERE authorId = :blockedId)"
              )
          )
        )
        .orWhere(
          new Brackets((qb) =>
            qb
              .where("userId = :blockedId")
              .andWhere(
                "postId IN (SELECT id FROM posts WHERE authorId = :authenticatedId)"
              )
          )
        )
        .setParameters({
          authenticatedId: authenticatedUser.id,
          blockedId: blockedUser.id,
        })
        .execute();
      await manager
        .getRepository(MentionEntity)
        .createQueryBuilder()
        .delete()
        .where(
          new Brackets((qb) =>
            qb
              .where("userId = :authenticatedId")
              .andWhere(
                "postId IN (SELECT id FROM posts WHERE authorId = :blockedId)"
              )
          )
        )
        .orWhere(
          new Brackets((qb) =>
            qb
              .where("userId = :blockedId")
              .andWhere(
                "postId IN (SELECT id FROM posts WHERE authorId = :authenticatedId)"
              )
          )
        )
        .setParameters({
          authenticatedId: authenticatedUser.id,
          blockedId: blockedUser.id,
        })
        .execute();
    });
  }
}
