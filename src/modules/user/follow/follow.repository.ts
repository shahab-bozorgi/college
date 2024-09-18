import { DataSource, Repository } from "typeorm";
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

export interface IFollowRepository {
  userFollowings(
    followerId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowingsList>>;
  userFollowers(
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
    id: FollowId
  ): Promise<FollowNotification | null>;
}

export class FollowRepository implements IFollowRepository {
  private flwrepo: Repository<FollowEntity>;

  constructor(private dataSource: DataSource) {
    this.flwrepo = dataSource.getRepository(FollowEntity);
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
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowersList>> {
    const result = await this.flwrepo.findAndCount({
      where: { followingId, followingStatus: FOLLOWING },
      relations: {
        follower: { avatar: true, followers: true },
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
          isCloseFriend: rs.isCloseFriend,
        };
      }),
      nextPage,
      totalPages,
    };
  }

  async userFollowings(
    followerId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowingsList>> {
    const result = await this.flwrepo.findAndCount({
      where: { followerId, followingStatus: FOLLOWING },
      relations: { following: { avatar: true, followers: true } },
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
          isCloseFriend: rs.following.followers.some(
            (follower) =>
              follower.followerId === followerId && follower.isCloseFriend
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
    id: FollowId
  ): Promise<FollowNotification | null> {
    const followRow: FollowNotification | null = await this.flwrepo.findOne({
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

    if (followRow !== null) return { following: followRow.following };

    return followRow;
  }
}
