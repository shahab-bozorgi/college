import { PaginatedResult } from "../../../data/pagination";
import { UUID } from "../../../data/uuid";
import { BadRequest, NotFound } from "../../../utilities/http-error";
import { CommentService } from "../../post/comment/comment.service";
import { PostService } from "../../post/post.service";
import { FollowService } from "../../user/follow/follow.service";
import { UserId } from "../../user/model/user-user-id";
import { UserService } from "../../user/user.service";
import { ActionType } from "../model/action-type";
import { countNotificationsByTypeDto } from "./dto/count-notifications-by-type.dto";
import { GetNotificationsDto } from "./dto/get-notifications.dto";
import { SeenNotificationsDto } from "./dto/seen-notifications.dto";
import { NotificationId } from "./model/notification-id";
import { NotificationType } from "./model/notification-type";
import { ShowNotification } from "./model/notification.model";
import { INotificationRepository } from "./notification.repository";

export class NotificationService {
  constructor(
    private notificationRepo: INotificationRepository,
    public userService: UserService,
    followService: FollowService,
    postService: PostService,
    commentService: CommentService
  ) {}
  async getNotifications(
    dto: GetNotificationsDto
  ): Promise<PaginatedResult<{ notifications: ShowNotification[] }>> {
    let showNotifications: ShowNotification[] = [];

    const { notifications, nextPage, totalPages } =
      await this.notificationRepo.getAllWithAction(dto);

    for (const notif of notifications) {
      const actor = await this.userService.getUserBy(notif.action.actorId);
      const receiver = await this.userService.getUserBy(notif.receiverId);

      if (actor === null) {
        throw new NotFound(`Actor of notification ${notif.id} not found`);
      }

      if (receiver === null) {
        throw new NotFound(`Actor of notification ${notif.id} not found`);
      }

      const showNotif: ShowNotification = {
        id: notif.id,
        action: {
          type: notif.action.type,
          entityId: notif.action.entityId,
        },
        actor: {
          id: actor.id,
          username: actor.username,
          firstName: actor.firstName ?? "",
          lastName: actor.lastName ?? "",
        },
        isSeen: notif.isSeen,
      };

      if (dto.notificationType === "friends") {
        showNotif.receiver = {
          id: receiver.id,
          username: receiver.username,
          firstName: receiver.firstName ?? "",
          lastName: receiver.lastName ?? "",
        };
      }

      if (!showNotif.content) {
        showNotif.content = { [notif.action.type]: {} };
      }

      showNotif.content[notif.action.type] = await this.getActionEntity(
        notif.action.type,
        notif.action.entityId
      );

      showNotifications.push(showNotif);
    }

    return { notifications: showNotifications, nextPage, totalPages };
  }

  private async getActionEntity(actionType: ActionType, entityId: UUID) {
    return await this.notificationRepo.getRelatedEntityByType(
      actionType,
      entityId
    );
  }

  async seenNotifications(
    dto: SeenNotificationsDto
  ): Promise<{ seenNotificationsStatus: boolean }> {
    if (
      await this.isInvalidSeenNotifications(dto.notificationIds, dto.receiverId)
    ) {
      throw new BadRequest(
        "Some notificationsIds are not for authenticated user!"
      );
    }

    return await this.notificationRepo.seen(dto);
  }

  async isInvalidSeenNotifications(
    notificationIds: NotificationId[],
    receiverId: UserId
  ): Promise<boolean> {
    return Boolean(
      (await this.notificationRepo.countInvalidSeenNotifications(
        notificationIds,
        receiverId
      )) > 0
    );
  }

  async countUnSeenNotifications(receiverId: UserId): Promise<{
    countUnseenNotifications: number;
  }> {
    return {
      countUnseenNotifications: await this.notificationRepo.countUnseen(
        receiverId
      ),
    };
  }

  async countUnseenNotificationsByType(
    dto: countNotificationsByTypeDto
  ): Promise<{
    countUnseenNotifications: number;
  }> {
    return {
      countUnseenNotifications: await this.notificationRepo.countUnseenByType(
        dto.receiverId,
        dto.notificationType
      ),
    };
  }
}
