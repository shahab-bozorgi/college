import { NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { DeleteActionDto } from "../../action/dto/delete-action.dto";
import { GetActionByTypeDto } from "../../action/dto/get-action-by-type.dto";
import { UpdateActionDto } from "../../action/dto/update-action.dto";
import { FollowService } from "../../user/follow/follow.service";
import { UserId } from "../../user/model/user-user-id";
import { UserService } from "../../user/user.service";
import { IActionNotificationRepository } from "../repository/action-notification.repository";

export class ActionNotificationService {
  constructor(
    private actionNotificationRepo: IActionNotificationRepository,
    private followService: FollowService,
    private userService: UserService
  ) {}

  async createActionWithNotifications(
    dto: CreateActionDto,
    personalReceiverId: UserId,
    closeFriendStatus?: boolean
  ): Promise<boolean> {
    const friendReceivers = await this.followService.findFollowers(dto.actorId);
    const personalReceiver = await this.userService.getUserBy(
      personalReceiverId
    );

    if (personalReceiver === null) {
      throw new NotFound("Personal receiver not found!");
    }

    const friendReceiverIds: UserId[] = [];

    if (dto.type !== "acceptFollow" && dto.type !== "requestFollow") {
      for (const friend of friendReceivers) {
        const friendStatus = await this.followService.getFollowingStatus(
          friend.followerId,
          personalReceiverId
        );

        if (
          friend.followerId === personalReceiverId ||
          friendStatus.status === "Blocked" ||
          (friendStatus.status !== "Following" &&
            personalReceiver.isPrivate === true) ||
          (closeFriendStatus === true &&
            friendStatus.isCloseFriend !== closeFriendStatus)
        ) {
          continue;
        }

        friendReceiverIds.push(friend.followerId);
      }
    }

    return this.actionNotificationRepo.create(
      dto,
      personalReceiverId,
      friendReceiverIds
    );
  }

  async getLastFollowActionByActorAndEntityId(dto: GetActionByTypeDto) {
    return await this.actionNotificationRepo.findLastByType(dto);
  }

  async getMentionActionByActorAndEntityId(dto: GetActionByTypeDto) {
    return await this.actionNotificationRepo.findLastByType(dto);
  }

  async updateRequestFollowToFollow(dto: UpdateActionDto) {
    const lastAction = await this.getLastFollowActionByActorAndEntityId({
      actorId: dto.actorId,
      entityId: dto.entityId,
      type: "requestFollow",
    });

    if (lastAction === null) {
      throw new NotFound("Action for update accept follow is not found");
    }

    const updateRequestFollowToAcceptActionStatus =
      await this.actionNotificationRepo.updateLastByType(
        lastAction.id,
        {
          actionDate: dto.actionDate,
          actorId: dto.actorId,
          entityId: dto.entityId,
        },
        "follow"
      );

    if (updateRequestFollowToAcceptActionStatus !== true) {
      throw new Error(
        `Update to acceptFollow for action ${lastAction.id} is failed`
      );
    }

    const unSeenNotifStatus =
      await this.actionNotificationRepo.unSeenNotificationsByActionId(
        lastAction.id
      );

    if (unSeenNotifStatus !== true) {
      throw new Error(
        `UnSeen notifications of action ${lastAction.id} is failed`
      );
    }
  }

  async updateActionOfMention(dto: UpdateActionDto) {
    const lastAction = await this.getMentionActionByActorAndEntityId({
      actorId: dto.actorId,
      entityId: dto.entityId,
      type: "mention",
    });

    if (lastAction === null) {
      throw new NotFound("Action for update mention is not found");
    }

    const updateMentionActionStatus =
      await this.actionNotificationRepo.updateLastByType(
        lastAction.id,
        {
          actionDate: dto.actionDate,
          actorId: dto.actorId,
          entityId: dto.entityId,
        },
        "follow"
      );

    if (updateMentionActionStatus !== true) {
      throw new Error(
        `Update to acceptFollow for action ${lastAction.id} is failed`
      );
    }

    const unSeenNotifStatus =
      await this.actionNotificationRepo.unSeenNotificationsByActionId(
        lastAction.id
      );

    if (unSeenNotifStatus !== true) {
      throw new Error(
        `UnSeen notifications of action ${lastAction.id} is failed`
      );
    }
  }

  async deleteRequestFollow(dto: DeleteActionDto): Promise<boolean> {
    const lastAction = await this.getLastFollowActionByActorAndEntityId({
      actorId: dto.actorId,
      entityId: dto.entityId,
      type: "requestFollow",
    });

    if (lastAction === null) {
      throw new NotFound("Action for update accept follow is not found");
    }

    const deleteNotifStatus =
      await this.actionNotificationRepo.deleteNotificationsByActionId(
        lastAction.id
      );

    if (deleteNotifStatus !== true) {
      throw new Error(
        `Delete notifications of action requestFollow ${lastAction.id} is failed`
      );
    }

    return await this.actionNotificationRepo.deleteActionById(lastAction.id);
  }

  async deleteActionOfMention(dto: DeleteActionDto): Promise<boolean> {
    const lastAction = await this.getMentionActionByActorAndEntityId({
      actorId: dto.actorId,
      entityId: dto.entityId,
      type: "mention",
    });

    if (lastAction === null) {
      throw new NotFound("Action for delete mention is not found");
    }

    const deleteNotifStatus =
      await this.actionNotificationRepo.deleteNotificationsByActionId(
        lastAction.id
      );

    if (deleteNotifStatus !== true) {
      throw new Error(
        `Delete notifications of action mention ${lastAction.id} is failed`
      );
    }

    return await this.actionNotificationRepo.deleteActionById(lastAction.id);
  }
}
