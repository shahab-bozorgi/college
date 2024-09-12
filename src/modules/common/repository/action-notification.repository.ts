import { DataSource } from "typeorm";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { UserId } from "../../user/model/user-user-id";
import { ActionEntity } from "../../action/entity/action.entity";
import { v4 } from "uuid";
import { NotificationEntity } from "../../action/notification/entity/notification.entity";
import { CreateNotification } from "../../action/notification/model/notification.model";

export interface IActionNotificationRepository {
  create(
    createActionDto: CreateActionDto,
    personalReceiverId: UserId,
    friendReceiverIds: UserId[]
  ): Promise<boolean>;
}

export class ActionNotificationRepository
  implements IActionNotificationRepository
{
  constructor(private readonly dataSource: DataSource) {}

  async create(
    createActionDto: CreateActionDto,
    personalReceiverId: UserId,
    friendReceiverIds: UserId[]
  ): Promise<boolean> {
    try {
      await this.dataSource.manager.transaction(async (manager) => {
        const action = manager.create(ActionEntity, {
          id: v4(),
          ...createActionDto,
        });
        await manager.save(action);

        if (action.actorId !== personalReceiverId) {
          const createNotification: CreateNotification = {
            actionId: action.id,
            receiverId: personalReceiverId,
            notificationType: "personal",
            isSeen: false,
          };

          const notification = manager.create(NotificationEntity, {
            id: v4(),
            ...createNotification,
          });
          await manager.save(notification);
        }

        for (const receiverId of friendReceiverIds) {
          const createNotification: CreateNotification = {
            actionId: action.id,
            receiverId: receiverId,
            notificationType: "friends",
            isSeen: false,
          };

          const notification = manager.create(NotificationEntity, {
            id: v4(),
            ...createNotification,
          });

          await manager.save(notification);
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
