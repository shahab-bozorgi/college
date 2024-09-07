import { PaginatedResult, PaginationDto } from "../../../data/pagination";
import { BadRequest, NotFound } from "../../../utilities/http-error";
import { UserId } from "../model/user-user-id";
import { UserService } from "../user.service";
import { BlockUserDto } from "./dto/block-user.dto";
import { GetFollowerListsDto } from "./dto/get-followers.dto";
import { GetFollowingListsDto } from "./dto/get-followings.dto";
import { UnblockUserDto } from "./dto/unblock-user.dto";
import { IFollowRepository } from "./follow.repository";
import { Blacklist } from "./model/blacklist.model";
import {
  Follow,
  FollowersList,
  FollowingsList,
  FollowingStatus,
  NOT_FOLLOWING,
  FOLLOWING,
  PENDING,
  BLOCKED,
} from "./model/follow.model";

export class FollowService {
  constructor(private flwRepo: IFollowRepository) {}

  async followUser(
    meId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<void> {
    if (meId === followingId) {
      throw new BadRequest("Don't follow yourself!");
    }

    const following = await userService.getUserBy(followingId);
    if (!following) {
      throw new NotFound("User not found!");
    }

    if ((await this.getFollowingStatus(meId, followingId)) === BLOCKED)
      throw new BadRequest(
        "You can't follow a user whom is in your blacklist."
      );

    const followingStatus = await this.getFollowingStatus(followingId, meId);

    switch (followingStatus) {
      case BLOCKED:
        throw new BadRequest("You can't follow this user.");
      case PENDING:
        throw new BadRequest(
          "Your prior follow request is pending user's approval."
        );
      case FOLLOWING:
        throw new BadRequest("You have already followed this user.");
    }

    if (following.isPrivate) {
      await this.flwRepo.create({
        followerId: meId,
        followingId,
        followingStatus: PENDING,
      });
    } else {
      await this.flwRepo.create({
        followerId: meId,
        followingId,
        followingStatus: FOLLOWING,
      });
    }
  }

  async unfollowUser(
    meId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<void> {
    if (meId === followingId)
      throw new BadRequest("I'm sure you couldn't have followed yourself.");

    const following = await userService.getUserBy(followingId);
    if (!following) {
      throw new NotFound("User not found!");
    }

    const followingStatus = await this.getFollowingStatus(followingId, meId);
    switch (followingStatus) {
      case BLOCKED:
      case NOT_FOLLOWING:
        throw new BadRequest("You haven't followed this user.");
    }

    await this.flwRepo.delete({
      followerId: meId,
      followingId,
    });
  }

  async deleteFollower(
    meId: UserId,
    followerId: UserId,
    userService: UserService
  ): Promise<void> {
    if (meId === followerId)
      throw new BadRequest("I'm sure you couldn't have followed yourself.");

    const follower = await userService.getUserBy(followerId);
    if (!follower) {
      throw new NotFound("User not found!");
    }

    const followingStatus = await this.getFollowingStatus(meId, followerId);
    if (followingStatus !== FOLLOWING)
      throw new BadRequest("User is not following you.");

    await this.flwRepo.delete({
      followerId,
      followingId: meId,
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

  async findFollowings(followerId: UserId): Promise<Follow[]> {
    return await this.flwRepo.findFollowings(followerId);
  }

  async acceptFollowUser(
    meId: UserId,
    followerId: UserId,
    userService: UserService
  ): Promise<void> {
    if (followerId === meId)
      throw new BadRequest(
        "I'm sure you couldn't have requested to follow yourself."
      );

    const follower = await userService.getUserBy(followerId);
    if (!follower) {
      throw new NotFound("User not found!");
    }
    const followingStatus = await this.getFollowingStatus(meId, followerId);
    if (followingStatus !== PENDING)
      throw new BadRequest("Follow request not found.");

    await this.flwRepo.update({
      followerId,
      followingId: meId,
      followingStatus: FOLLOWING,
    });
  }

  async rejectFollowUser(
    meId: UserId,
    followerId: UserId,
    userService: UserService
  ): Promise<void> {
    const follower = await userService.getUserBy(followerId);
    if (!follower) {
      throw new NotFound("User not found!");
    }

    const followingStatus = await this.getFollowingStatus(meId, followerId);
    if (followingStatus !== PENDING)
      throw new NotFound("Follow request not found.");

    await this.flwRepo.delete({
      followerId,
      followingId: meId,
    });
  }

  async getFollowingStatus(
    followingId: UserId,
    followerId: UserId
  ): Promise<FollowingStatus> {
    const record = await this.flwRepo.findByFollowerAndFollowing(
      followerId,
      followingId
    );

    return record ? record.followingStatus : NOT_FOLLOWING;
  }

  async blockUser(meId: UserId, dto: BlockUserDto): Promise<void> {
    if (meId === dto.userId)
      throw new BadRequest("Please don't block yourself, will you?");

    const blockedUserStatus = await this.getFollowingStatus(meId, dto.userId);

    if (blockedUserStatus === BLOCKED)
      throw new BadRequest("User is already blocked.");

    if (blockedUserStatus === NOT_FOLLOWING) {
      await this.flwRepo.create({
        followingId: meId,
        followerId: dto.userId,
        followingStatus: BLOCKED,
      });
    } else {
      await this.flwRepo.update({
        followingId: meId,
        followerId: dto.userId,
        followingStatus: BLOCKED,
      });
    }

    const meStatus = await this.getFollowingStatus(dto.userId, meId);
    if (meStatus !== BLOCKED) {
      await this.flwRepo.delete({
        followingId: dto.userId,
        followerId: meId,
      });
    }
  }

  async unblockUser(meId: UserId, dto: UnblockUserDto): Promise<void> {
    if (meId === dto.userId)
      throw new BadRequest("I'm sure you couldn't have blocked yourself.");

    const blockedUserStatus = await this.getFollowingStatus(meId, dto.userId);
    if (blockedUserStatus !== BLOCKED)
      throw new BadRequest("You haven't blocked this user.");

    await this.flwRepo.delete({
      followingId: meId,
      followerId: dto.userId,
    });
  }

  async getBlackList(
    meId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<Blacklist>> {
    return await this.flwRepo.userBlackList(meId, pagination);
  }
}
