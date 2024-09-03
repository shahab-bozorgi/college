import { DataSource, Repository } from "typeorm";
import { UserId } from "../model/user-user-id";
import { FollowEntity } from "./entity/follow.entity";
import {
  CreateFollow,
  DeleteFollow,
  Follow,
  UpdateFollow,
} from "./model/follow.model";
import { UserEntity } from "../entity/user.entity";
import { GetFollowerListsDto } from "./dto/get-followers.dto";
import { GetFollowingListsDto } from "./dto/get-followings.dto";
import { paginationSkip } from "../../../data/pagination";

export interface IFollowRepository {
  findFollowing(user: UserEntity): Promise<Follow[]>;
  findFollowingByUser(dto: GetFollowingListsDto): Promise<UserEntity[]>;
  findFollowers(user: UserEntity): Promise<Follow[]>;
  findFollowersByUser(dto: GetFollowerListsDto): Promise<UserEntity[]>;
  countFollowing(followingId: UserId): Promise<number>;
  countFollowers(followerId: UserId): Promise<number>;
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

  async countFollowers(followerId: UserId): Promise<number> {
    return this.flwrepo.countBy({ followerId: followerId });
  }

  async countFollowing(followingId: UserId): Promise<number> {
    return this.flwrepo.countBy({ followingId: followingId });
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
  async findFollowersByUser(dto: GetFollowerListsDto): Promise<UserEntity[]> {
    const followers = await this.flwrepo.find({
      where: { following: { id: dto.followingId } },
      relations: ["follower", "follower.avatar"],
      skip: paginationSkip({ page: dto.page, limit: dto.limit }),
      take: dto.limit,
    });

    return followers.map((follow) => follow.follower);
  }

  async findFollowingByUser(dto: GetFollowingListsDto): Promise<UserEntity[]> {
    const followings = await this.flwrepo.find({
      where: { follower: { id: dto.followerId } },
      relations: ["following", "following.avatar"],
      skip: paginationSkip({ page: dto.page, limit: dto.limit }),
      take: dto.limit,
    });

    return followings.map((follow) => follow.following);
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
