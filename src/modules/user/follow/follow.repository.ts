import { DataSource, Repository } from "typeorm";
import { UserId } from "../model/user-user-id";
import { FollowEntity } from "./entity/follow.entity";
import {
  CreateFollow,
  DeleteFollow,
  Follow,
  FollowersList,
  FollowingsList,
  UpdateFollow,
} from "./model/follow.model";
import { UserEntity } from "../entity/user.entity";
import {
  PaginatedResult,
  PaginationDto,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";

export interface IFollowRepository {
  findFollowing(user: UserEntity): Promise<Follow[]>;
  userFollowings(
    followerId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowingsList>>;
  userFollowers(
    followingId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<FollowersList>>;
  findFollowers(user: UserEntity): Promise<Follow[]>;
  countFollowings(followerId: UserId): Promise<number>;
  countFollowers(followingId: UserId): Promise<number>;
  delete(follow: DeleteFollow): Promise<boolean>;
  update(follow: UpdateFollow): Promise<Follow>;
  create(follow: CreateFollow): Promise<Follow>;

  findByFollowerAndFollowing(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null>;
}

export class FollowRepository implements IFollowRepository {
  private flwrepo: Repository<FollowEntity>;

  constructor(private dataSource: DataSource) {
    this.flwrepo = dataSource.getRepository(FollowEntity);
  }

  async findFollowers(user: UserEntity): Promise<Follow[]> {
    return this.flwrepo.find({
      where: { following: user },
      relations: ["follower"],
    });
  }

  async findFollowing(user: UserEntity): Promise<Follow[]> {
    return this.flwrepo.find({
      where: { follower: user },
      relations: ["following"],
    });
  }

  async countFollowers(followingId: UserId): Promise<number> {
    return this.flwrepo.count({
      where: { followingId, requestStatus: "accepted" },
    });
  }

  async countFollowings(followerId: UserId): Promise<number> {
    return this.flwrepo.count({
      where: { followerId, requestStatus: "accepted" },
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
      where: { followingId, requestStatus: "accepted" },
      relations: { follower: { avatar: true } },
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
          followersCount: rs.follower.followersCount,
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
      where: { followerId, requestStatus: "accepted" },
      relations: { following: { avatar: true } },
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
          followersCount: rs.following.followersCount,
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
    const queryRunner = this.dataSource.createQueryRunner();
    const followManagerRepo = queryRunner.manager.getRepository(FollowEntity);
    const userManagerRepo = queryRunner.manager.getRepository(UserEntity);

    await queryRunner.startTransaction();

    try {
      await followManagerRepo.delete({
        followerId: follow.followerId,
        followingId: follow.followingId,
      });

      await userManagerRepo.decrement(
        { id: follow.followerId },
        "followingsCount",
        1
      );
      await userManagerRepo.decrement(
        { id: follow.followingId },
        "followersCount",
        1
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      console.error("Transaction failed:", err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  async update(follow: UpdateFollow): Promise<Follow> {
    const queryRunner = this.dataSource.createQueryRunner();
    const followManagerRepo = queryRunner.manager.getRepository(FollowEntity);
    const userManagerRepo = queryRunner.manager.getRepository(UserEntity);

    await queryRunner.startTransaction();

    try {
      await followManagerRepo.update(
        {
          followerId: follow.followerId,
          followingId: follow.followingId,
        },
        {
          requestStatus: follow.requestStatus,
        }
      );

      await userManagerRepo.increment(
        { id: follow.followerId },
        "followingsCount",
        1
      );
      await userManagerRepo.increment(
        { id: follow.followingId },
        "followersCount",
        1
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      console.error("Transaction failed:", err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return follow;
  }
}
