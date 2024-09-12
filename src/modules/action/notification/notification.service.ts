import { PaginatedResult } from "../../../data/pagination";
import { UUID } from "../../../data/uuid";
import { NotFound } from "../../../utilities/http-error";
import { CommentService } from "../../post/comment/comment.service";
import { PostService } from "../../post/post.service";
import { FollowService } from "../../user/follow/follow.service";
import { UserService } from "../../user/user.service";
import { ActionType } from "../model/action-type";
import { GetNotificationsDto } from "./dto/get-notifications.dto";
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
}
