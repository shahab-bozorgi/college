import { PaginatedResult, PaginationDto } from "../../../data/pagination";
import { BadRequest, NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { ActionNotificationService } from "../../common/service/action-notification.service";
import { MediaId } from "../../media/model/media-id";
import { UserId } from "../model/user-user-id";
import { User } from "../model/user.model";
import { UserService } from "../user.service";
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
  constructor(
    private flwRepo: IFollowRepository,
    private userService: UserService
  ) {}

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
    userService: UserService,
    actionNotificationService: ActionNotificationService
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

    const followRow = await this.flwRepo.findByFollowerAndFollowing(
      authenticatedId,
      followingId
    );

    if (followRow === null) {
      throw new NotFound("Follow Row is not found");
    }

    await this.flwRepo.delete({
      followerId: followRow.followerId,
      followingId: followRow.followingId,
    });

    switch (followRow.followingStatus) {
      case "Following":
        await actionNotificationService.deleteFollow({
          actorId: followRow.followerId,
          entityId: followRow.id,
        });

      case "Pending":
        await actionNotificationService.deleteRequestFollow({
          actorId: followRow.followerId,
          entityId: followRow.id,
        });
    }
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

    const follower = await userService.getUserBy(followerId, ["avatar"]);
    if (!follower) {
      throw new NotFound("Follower User not found!");
    }

    let followerMediaId: MediaId | null = null;
    if (follower.avatar) {
      followerMediaId = follower.avatar.id;
    }

    const followRow = await this.getFollow(followerId, authenticatedId);

    if (followRow === null || followRow.followingStatus !== PENDING) {
      throw new NotFound("No Pending request was found");
    }
    const followUpdated = await this.flwRepo.update({
      id: followRow.id,
      followerId,
      followingId: authenticatedId,
      followingStatus: FOLLOWING,
    });

    await actionNotificationService.updateRequestFollowToFollow({
      actorId: followUpdated.followerId,
      entityId: followUpdated.id,
      actionDate: followUpdated.updatedAt,
      mediaId: followerMediaId,
    });

    let mediaId: MediaId | null = null;
    const authenticatedUser = await userService.getUserBy(authenticatedId, [
      "avatar",
    ]);
    if (authenticatedUser) {
      if (authenticatedUser.avatar) {
        mediaId = authenticatedUser.avatar.id;
      }
    }

    const actionDto: CreateActionDto = {
      actorId: followUpdated.followingId,
      type: "acceptFollow",
      entityId: followUpdated.id,
      actionDate: followUpdated.updatedAt,
      mediaId: mediaId,
    };

    await actionNotificationService.createActionWithNotifications(
      actionDto,
      followUpdated.followingId
    );
  }

  async rejectFollowUser(
    authenticatedId: UserId,
    followerId: UserId,
    userService: UserService,
    actionNotificationService: ActionNotificationService
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

    const followRow = await this.getFollow(followerId, authenticatedId);
    if (followRow === null) {
      throw new NotFound("Follow Record is not found");
    }

    await this.flwRepo.delete({
      followerId,
      followingId: authenticatedId,
    });

    await actionNotificationService.deleteRequestFollow({
      actorId: followRow.followerId,
      entityId: followRow.id,
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

  async blockUser(authenticatedUser: User, blockedId: UserId): Promise<void> {
    if (authenticatedUser.id === blockedId)
      throw new BadRequest("Please don't block yourself, will you?");

    const blockedUser = await this.userService.getUserBy(blockedId);
    if (!blockedUser) throw new BadRequest("No user was found by that ID.");

    const blockedUserStatus = (
      await this.getFollowingStatus(authenticatedUser.id, blockedUser.id)
    ).status;

    if (blockedUserStatus === BLOCKED)
      throw new BadRequest("User is already blocked.");

    await this.flwRepo.blockUser(authenticatedUser, blockedUser);
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

    const followRow = await this.getFollow(followerId, authenticatedId);
    if (followRow === null || followRow.followingStatus !== FOLLOWING) {
      throw new BadRequest(
        "Users must be following you in order to add them to your close friends."
      );
    }

    if (followRow.isCloseFriend)
      throw new BadRequest("User is already in your close friends.");

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

    const followRow = await this.getFollow(followerId, authenticatedId);
    if (followRow === null || !followRow.isCloseFriend) {
      throw new BadRequest("User is not in your close frineds.");
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
