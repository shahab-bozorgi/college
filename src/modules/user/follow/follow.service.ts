import { PaginatedResult, paginationInfo } from "../../../data/pagination";
import {
  BadRequest,
  DuplicatedRecord,
  NotFound,
} from "../../../utilities/http-error";
import { UserId } from "../model/user-user-id";
import { FollowingStatus } from "../model/user.model";
import { UserService } from "../user.service";
import { GetFollowerListsDto } from "./dto/get-followers.dto";
import { GetFollowingListsDto } from "./dto/get-followings.dto";
import { IFollowRepository } from "./follow.repository";
import { Follow, FollowersList, FollowingsList } from "./model/follow.model";

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
  ): Promise<PaginatedResult<FollowersList>> {
    return await this.flwRepo.userFollowers(dto.followingId, {
      page: dto.page,
      limit: dto.limit,
    });
  }

  async getFollowings(
    dto: GetFollowingListsDto
  ): Promise<PaginatedResult<FollowingsList>> {
    return await this.flwRepo.userFollowings(dto.followerId, {
      page: dto.page,
      limit: dto.limit,
    });
  }

  async getcountFollowers(followerId: UserId): Promise<number> {
    return await this.flwRepo.countFollowers(followerId);
  }

  async getcountFollowing(followingId: UserId): Promise<number> {
    return await this.flwRepo.countFollowings(followingId);
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

  async getFollowingStatus(
    followingId: UserId,
    followerId: UserId
  ): Promise<FollowingStatus> {
    const record = await this.flwRepo.findByFollowerAndFollowing(
      followerId,
      followingId
    );

    if (!record) return "NotFollowed";

    switch (record.requestStatus) {
      case "accepted":
        return "Followed";
      case "pending":
        return "PendingApproval";
    }
  }
}
