import { PaginatedResult, PaginationDto } from "../../../data/pagination";
import { BadRequest, NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { ActionNotificationService } from "../../common/service/action-notification.service";
import { MediaId } from "../../media/model/media-id";
import { UserId } from "../model/user-user-id";
import { User } from "../model/user.model";
import { UserService } from "../user.service";
import { BlockUserDto } from "./dto/block-user.dto";
import { GetFollowerListsDto } from "./dto/get-followers.dto";
import { GetFollowingListsDto } from "./dto/get-followings.dto";
import { UnblockUserDto } from "./dto/unblock-user.dto";
import { IFollowRepository } from "./follow.repository";
import { Blacklist } from "./model/blacklist.model";
import { CloseFriends } from "./model/close-friend.model";
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
    authenticatedId: UserId,
    followingId: UserId,
    userService: UserService,
    actionNotificationService: ActionNotificationService
  ): Promise<void> {
    if (authenticatedId === followingId) {
      throw new BadRequest("Don't follow yourself!");
    }

    const following = await userService.getUserBy(followingId);
    if (!following) {
      throw new NotFound("User not found!");
    }

    if (
      (await this.getFollowingStatus(authenticatedId, followingId)).status ===
      BLOCKED
    )
      throw new BadRequest(
        "You can't follow a user whom is in your blacklist."
      );

    const followingStatus = (
      await this.getFollowingStatus(followingId, authenticatedId)
    ).status;

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

    let mediaId: MediaId | null = null;

    const authenticatedUser = await userService.getUserBy(authenticatedId, [
      "avatar",
    ]);

    if (authenticatedUser !== null) {
      if (
        authenticatedUser.avatar !== null &&
        authenticatedUser.avatar !== undefined
      ) {
        mediaId = authenticatedUser.avatar.id;
      }
    }

    if (following.isPrivate) {
      const followCreated = await this.flwRepo.create({
        followerId: authenticatedId,
        followingId,
        followingStatus: PENDING,
      });

      const actionDto: CreateActionDto = {
        actorId: followCreated.followerId,
        type: "requestFollow",
        entityId: followCreated.id,
        actionDate: followCreated.createdAt,
        mediaId: mediaId,
      };

      await actionNotificationService.createActionWithNotifications(
        actionDto,
        followCreated.followingId
      );
    } else {
      const followCreated = await this.flwRepo.create({
        followerId: authenticatedId,
        followingId,
        followingStatus: FOLLOWING,
      });

      const actionDto: CreateActionDto = {
        actorId: followCreated.followerId,
        type: "follow",
        entityId: followCreated.id,
        actionDate: followCreated.createdAt,
        mediaId: mediaId,
      };

      await actionNotificationService.createActionWithNotifications(
        actionDto,
        followCreated.followingId
      );
    }
  }

  async unfollowUser(
    authenticatedId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<void> {
    if (authenticatedId === followingId)
      throw new BadRequest("I'm sure you couldn't have followed yourself.");

    const following = await userService.getUserBy(followingId);
    if (!following) {
      throw new NotFound("User not found!");
    }

    const followingStatus = (
      await this.getFollowingStatus(followingId, authenticatedId)
    ).status;
    switch (followingStatus) {
      case BLOCKED:
      case NOT_FOLLOWING:
        throw new BadRequest("You haven't followed this user.");
    }

    await this.flwRepo.delete({
      followerId: authenticatedId,
      followingId,
    });
  }

  async deleteFollower(
    authenticatedId: UserId,
    followerId: UserId,
    userService: UserService
  ): Promise<void> {
    if (authenticatedId === followerId)
      throw new BadRequest("I'm sure you couldn't have followed yourself.");

    const follower = await userService.getUserBy(followerId);
    if (!follower) {
      throw new NotFound("User not found!");
    }

    const followingStatus = (
      await this.getFollowingStatus(authenticatedId, followerId)
    ).status;
    if (followingStatus !== FOLLOWING)
      throw new BadRequest("User is not following you.");

    await this.flwRepo.delete({
      followerId,
      followingId: authenticatedId,
    });
  }

  async getFollow(followerId: UserId, followingId: UserId) {
    return await this.flwRepo.findByFollowerAndFollowing(
      followerId,
      followingId
    );
  }

  async getFollowers(
    authenticatedUser: User,
    dto: GetFollowerListsDto
  ): Promise<PaginatedResult<FollowersList>> {
    return await this.flwRepo.userFollowers(
      authenticatedUser,
      dto.followingId,
      {
        page: dto.page,
        limit: dto.limit,
      }
    );
  }

  async getFollowings(
    authenticatedUser: User,
    dto: GetFollowingListsDto
  ): Promise<PaginatedResult<FollowingsList>> {
    return await this.flwRepo.userFollowings(
      authenticatedUser,
      dto.followerId,
      {
        page: dto.page,
        limit: dto.limit,
      }
    );
  }

  async getcountFollowers(followerId: UserId): Promise<number> {
    return await this.flwRepo.countFollowers(followerId);
  }

  async getcountFollowing(followingId: UserId): Promise<number> {
    return await this.flwRepo.countFollowings(followingId);
  }

  async findFollowings(followerId: UserId): Promise<Follow[]> {
    return await this.flwRepo.findFollowings(followerId, FOLLOWING);
  }

  async findFollowers(followingId: UserId): Promise<Follow[]> {
    return await this.flwRepo.findFollowers(followingId, FOLLOWING);
  }

  async acceptFollowUser(
    authenticatedId: UserId,
    followerId: UserId,
    userService: UserService,
    actionNotificationService: ActionNotificationService
  ): Promise<void> {
    if (followerId === authenticatedId)
      throw new BadRequest(
        "I'm sure you couldn't have requested to follow yourself."
      );

    const follower = await userService.getUserBy(followerId);
    if (!follower) {
      throw new NotFound("User not found!");
    }
    const followingStatus = (
      await this.getFollowingStatus(authenticatedId, followerId)
    ).status;
    if (followingStatus !== PENDING)
      throw new BadRequest("Follow request not found.");

    const followRow = await this.getFollow(followerId, authenticatedId);
    if (followRow === null) {
      throw new NotFound("Follow Record is not found");
    }

    const followUpdated = await this.flwRepo.update({
      id: followRow.id,
      followerId,
      followingId: authenticatedId,
      followingStatus: FOLLOWING,
    });

    await actionNotificationService.updateRequestFollowToAcceptFollow({
      actorId: followUpdated.followerId,
      entityId: followUpdated.id,
      actionDate: followUpdated.updatedAt,
    });
  }

  async rejectFollowUser(
    authenticatedId: UserId,
    followerId: UserId,
    userService: UserService
  ): Promise<void> {
    const follower = await userService.getUserBy(followerId);
    if (!follower) {
      throw new NotFound("User not found!");
    }

    const followingStatus = (
      await this.getFollowingStatus(authenticatedId, followerId)
    ).status;
    if (followingStatus !== PENDING)
      throw new NotFound("Follow request not found.");

    await this.flwRepo.delete({
      followerId,
      followingId: authenticatedId,
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

    return {
      status: record ? record.followingStatus : NOT_FOLLOWING,
      isCloseFriend: record ? record.isCloseFriend : false,
    };
  }

  async blockUser(authenticatedId: UserId, dto: BlockUserDto): Promise<void> {
    if (authenticatedId === dto.userId)
      throw new BadRequest("Please don't block yourself, will you?");

    const blockedUserStatus = (
      await this.getFollowingStatus(authenticatedId, dto.userId)
    ).status;

    if (blockedUserStatus === BLOCKED)
      throw new BadRequest("User is already blocked.");

    const followRow = await this.getFollow(dto.userId, authenticatedId);
    if (followRow === null) {
      throw new NotFound("Follow Record is not found");
    }

    if (blockedUserStatus === NOT_FOLLOWING) {
      await this.flwRepo.create({
        followingId: authenticatedId,
        followerId: dto.userId,
        followingStatus: BLOCKED,
      });
    } else {
      await this.flwRepo.update({
        id: followRow.id,
        followingId: authenticatedId,
        followerId: dto.userId,
        followingStatus: BLOCKED,
      });
    }

    const authenticatedStatus = (
      await this.getFollowingStatus(dto.userId, authenticatedId)
    ).status;
    if (authenticatedStatus !== BLOCKED) {
      await this.flwRepo.delete({
        followingId: dto.userId,
        followerId: authenticatedId,
      });
    }
  }

  async unblockUser(
    authenticatedId: UserId,
    dto: UnblockUserDto
  ): Promise<void> {
    if (authenticatedId === dto.userId)
      throw new BadRequest("I'm sure you couldn't have blocked yourself.");

    const blockedUserStatus = (
      await this.getFollowingStatus(authenticatedId, dto.userId)
    ).status;
    if (blockedUserStatus !== BLOCKED)
      throw new BadRequest("You haven't blocked this user.");

    await this.flwRepo.delete({
      followingId: authenticatedId,
      followerId: dto.userId,
    });
  }

  async getBlacklist(
    authenticatedId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<Blacklist>> {
    return await this.flwRepo.userBlacklist(authenticatedId, pagination);
  }

  async findWhereUserIsBlocked(followerId: UserId): Promise<Follow[]> {
    return await this.flwRepo.findFollowings(followerId, BLOCKED);
  }

  async findWhereUserHasBlocked(followingId: UserId): Promise<Follow[]> {
    return await this.flwRepo.findFollowers(followingId, BLOCKED);
  }

  async addCloseFriend(
    followerId: UserId,
    authenticatedId: UserId
  ): Promise<void> {
    if (followerId === authenticatedId)
      throw new BadRequest("You cannot add your self to your close friends.");

    const followingStatus = await this.getFollowingStatus(
      authenticatedId,
      followerId
    );
    if (followingStatus.status !== FOLLOWING)
      throw new BadRequest(
        "Users must be following you in order to add them to your close friends."
      );

    if (followingStatus.isCloseFriend)
      throw new BadRequest("User is already in your close friends.");

    const followRow = await this.getFollow(followerId, authenticatedId);
    if (followRow === null) {
      throw new NotFound("Follow Record is not found");
    }

    await this.flwRepo.update({
      id: followRow.id,
      followingId: authenticatedId,
      followerId,
      isCloseFriend: true,
    });
  }

  async removeCloseFriend(
    followerId: UserId,
    authenticatedId: UserId
  ): Promise<void> {
    if (followerId === authenticatedId)
      throw new BadRequest(
        "Follower id and authenticated user id can't be the same."
      );

    if (
      !(await this.getFollowingStatus(authenticatedId, followerId))
        .isCloseFriend
    )
      throw new BadRequest("User is not in your close frineds.");

    const followRow = await this.getFollow(followerId, authenticatedId);
    if (followRow === null) {
      throw new NotFound("Follow Record is not found");
    }

    await this.flwRepo.update({
      id: followRow.id,
      followerId,
      followingId: authenticatedId,
      isCloseFriend: false,
    });
  }

  async getCloseFriends(
    authenticatedId: UserId,
    pagination: PaginationDto
  ): Promise<PaginatedResult<CloseFriends>> {
    return await this.flwRepo.userCloseFriends(authenticatedId, pagination);
  }
}
