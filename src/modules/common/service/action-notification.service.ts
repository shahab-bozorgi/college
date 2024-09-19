import { NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
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

    if (typeof closeFriendStatus !== "boolean") {
      closeFriendStatus = false;
    }

    if (personalReceiver === null) {
      throw new NotFound("Personal receiver not found!");
    }

    const friendReceiverIds: UserId[] = [];

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
        friendStatus.isCloseFriend !== closeFriendStatus
      ) {
        continue;
      }

      friendReceiverIds.push(friend.followerId);
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

  async updateFollowToAcceptFollow(dto: UpdateActionDto) {
    const lastAction = await this.getLastFollowActionByActorAndEntityId({
      actorId: dto.actorId,
      entityId: dto.entityId,
      type: "follow",
    });

    if (lastAction === null) {
      throw new NotFound("Action for update accept follow is not found");
    }

    const updateFollowToAcceptActionStatus =
      await this.actionNotificationRepo.updateLastByType(
        lastAction.id,
        {
          actionDate: dto.actionDate,
          actorId: dto.actorId,
          entityId: dto.entityId,
        },
        "acceptFollow"
      );

    if (updateFollowToAcceptActionStatus !== true) {
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
}
