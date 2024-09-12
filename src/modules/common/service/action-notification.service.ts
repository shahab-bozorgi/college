import { boolean } from "zod";
import { NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
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
}
