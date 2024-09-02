import { PaginatedResult, paginationInfo } from "../../../data/pagination";
import {
  BadRequest,
  DuplicatedRecord,
  NotFound,
} from "../../../utilities/http-error";
import { UserId } from "../model/user-user-id";
import { UserService } from "../user.service";
import { GetFollowerListsDto } from "./dto/get-followers.dto";
import { GetFollowingListsDto } from "./dto/get-followings.dto";
import { IFollowRepository } from "./follow.repository";
import { Follow } from "./model/follow.model";
import { Follower } from "./model/follower";
import { Following } from "./model/following";

export class FollowService {
  constructor(private flwRepo: IFollowRepository) {}

  async followUser(
    followerId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<Follow> {
    if (followerId == followingId) {
      throw new BadRequest("Dont follow yourself!");
    }

    const follower = await userService.getUserBy(followerId);
    const following = await userService.getUserBy(followingId);

    if (!following) {
      throw new NotFound("Following not found!");
    }

    if (!follower) {
      throw new NotFound("Follower not found!");
    }

    const followEntity = await this.getFollow(follower.id, following.id);
    if (followEntity) {
      throw new DuplicatedRecord("Follow record is duplicated!");
    }

    if (following.is_private !== true) {
      await this.flwRepo.create({
        followerId: follower.id,
        followingId: following.id,
        requestStatus: "accepted",
      });

      return await this.flwRepo.update({
        followerId: follower.id,
        followingId: following.id,
        requestStatus: "accepted",
      });
    }

    return await this.flwRepo.create({
      followerId: follower.id,
      followingId: following.id,
      requestStatus: "pending",
    });
  }

  async getFollow(followerId: UserId, followingId: UserId) {
    return await this.flwRepo.findByFollowerAndFollowing(
      followerId,
      followingId
    );
  }

  async getFollowers(
    dto: GetFollowerListsDto
  ): Promise<PaginatedResult<{ followers: Follower[] }>> {
    const followersEntities = await this.flwRepo.findFollowersByUser(dto);
    const followersUsers: Follower[] = await Promise.all(
      followersEntities.map(async (followerEntity) => {
        return {
          id: followerEntity.id,
          avatar: followerEntity.avatar ? followerEntity.avatar.path : null,
          username: followerEntity.username,
          first_name: followerEntity.first_name,
          last_name: followerEntity.last_name,
          bio: followerEntity.bio,
          followersCount: followerEntity.followersCount,
        };
      })
    );

    const { nextPage, totalPages } = paginationInfo(
      await this.flwRepo.countFollowing(dto.followingId),
      {
        page: dto.page,
        limit: dto.limit,
      }
    );

    return {
      followers: followersUsers,
      nextPage,
      totalPages,
    };
  }

  async getcountFollowers(followerId: UserId): Promise<number> {
    return await this.flwRepo.countFollowers(followerId);
  }

  async getcountFollowing(followingId: UserId): Promise<number> {
    return await this.flwRepo.countFollowing(followingId);
  }

  async getFollowings(
    dto: GetFollowingListsDto
  ): Promise<PaginatedResult<{ followings: Following[] }>> {
    const followingEntities = await this.flwRepo.findFollowingByUser(dto);

    const followingUsers = await Promise.all(
      followingEntities.map(async (followingEntity) => {
        return {
          id: followingEntity.id,
          avatar: followingEntity.avatar ? followingEntity.avatar.path : null,
          username: followingEntity.username,
          first_name: followingEntity.first_name,
          last_name: followingEntity.last_name,
          bio: followingEntity.bio,
          followersCount: followingEntity.followersCount,
        };
      })
    );

    const { nextPage, totalPages } = paginationInfo(
      await this.flwRepo.countFollowing(dto.followerId),
      {
        page: dto.page,
        limit: dto.limit,
      }
    );

    return {
      followings: followingUsers,
      nextPage,
      totalPages,
    };
  }

  async unfollowUser(
    followerId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<{ unfollowStatus: boolean }> {
    const follower = await userService.getUserBy(followerId);
    const following = await userService.getUserBy(followingId);

    if (!following) {
      throw new NotFound("Following not found!");
    }

    if (!follower) {
      throw new NotFound("Follower not found!");
    }

    const followEntity = await this.getFollow(follower.id, following.id);

    if (!followEntity) {
      throw new NotFound("Follow not found!");
    }

    return {
      unfollowStatus: await this.flwRepo.delete({
        followerId: followEntity.followerId,
        followingId: followEntity.followingId,
      }),
    };
  }

  async acceptFollowUser(
    followerId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<Follow> {
    const follower = await userService.getUserBy(followerId);
    const following = await userService.getUserBy(followingId);

    if (!following) {
      throw new NotFound("Following not found!");
    }

    if (!follower) {
      throw new NotFound("Follower not found!");
    }

    const followEntity = await this.getFollow(follower.id, following.id);

    if (!followEntity) {
      throw new NotFound("Follow not found!");
    }

    return await this.flwRepo.update({
      followerId: followEntity.followerId,
      followingId: followEntity.followingId,
      requestStatus: "accepted",
    });
  }

  async rejectFollowUser(
    followerId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<{ rejectStatus: boolean }> {
    const follower = await userService.getUserBy(followerId);
    const following = await userService.getUserBy(followingId);

    if (!following) {
      throw new NotFound("Following not found!");
    }

    if (!follower) {
      throw new NotFound("Follower not found!");
    }

    const followEntity = await this.getFollow(follower.id, following.id);

    if (!followEntity) {
      throw new NotFound("Follow not found!");
    }

    return {
      rejectStatus: await this.flwRepo.delete({
        followerId: followEntity.followerId,
        followingId: followEntity.followingId,
      }),
    };
  }
}
