import { DataSource, In } from "typeorm";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { UserId } from "../../user/model/user-user-id";
import { ActionEntity } from "../../action/entity/action.entity";
import { v4 } from "uuid";
import { NotificationEntity } from "../../action/notification/entity/notification.entity";
import { CreateNotification } from "../../action/notification/model/notification.model";
import { GetActionByTypeDto } from "../../action/dto/get-action-by-type.dto";
import { Action } from "../../action/model/action.model";
import { UpdateActionDto } from "../../action/dto/update-action.dto";
import { ActionId } from "../../action/model/action-id";
import { ActionType } from "../../action/model/action-type";
import { UUID } from "../../../data/uuid";

export interface IActionNotificationRepository {
  create(
    createActionDto: CreateActionDto,
    personalReceiverId: UserId,
    friendReceiverIds: UserId[]
  ): Promise<boolean>;
  findLastByType(dto: GetActionByTypeDto): Promise<Action | null>;
  deleteActionFollow(
    entityId: UUID,
    actorId: UserId,
    type: "follow" | "acceptFollow"
  ): Promise<boolean>;
  updateLastByType(
    id: ActionId,
    dto: UpdateActionDto,
    type: ActionType
  ): Promise<boolean>;
  unSeenNotificationsByActionId(actionId: ActionId): Promise<boolean>;
  deleteNotificationsByActionId(actionId: ActionId): Promise<boolean>;
  deleteActionById(id: ActionId): Promise<boolean>;
}

export class ActionNotificationRepository
  implements IActionNotificationRepository
{
  private actionRepo;
  private notificationRepo;

  constructor(private readonly dataSource: DataSource) {
    this.actionRepo = dataSource.getRepository(ActionEntity);
    this.notificationRepo = dataSource.getRepository(NotificationEntity);
  }

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

  async findLastByType(dto: GetActionByTypeDto): Promise<Action | null> {
    return await this.actionRepo.findOne({
      where: {
        entityId: dto.entityId,
        type: dto.type,
        actorId: dto.actorId,
      },
      order: { actionDate: "DESC" },
    });
  }

  async updateLastByType(
    id: ActionId,
    dto: UpdateActionDto,
    type: ActionType
  ): Promise<boolean> {
    return Boolean(
      (
        await this.actionRepo.update(
          { id },
          { actionDate: dto.actionDate, mediaId: dto.mediaId, type }
        )
      ).affected
    );
  }

  async unSeenNotificationsByActionId(actionId: ActionId): Promise<boolean> {
    return Boolean(
      (await this.notificationRepo.update({ actionId }, { isSeen: false }))
        .affected
    );
  }

  async deleteNotificationsByActionId(actionId: ActionId): Promise<boolean> {
    return Boolean((await this.notificationRepo.delete({ actionId })).affected);
  }

  async deleteActionById(id: ActionId): Promise<boolean> {
    return Boolean((await this.actionRepo.delete({ id })).affected);
  }

  async deleteActionFollow(
    entityId: UUID,
    actorId: UserId,
    type: "follow" | "acceptFollow"
  ): Promise<boolean> {
    const actions = await this.actionRepo.find({
      select: {
        id: true,
      },
      where: {
        actorId: actorId,
        entityId: entityId,
        type: type,
      },
    });

    for (const action of actions) {
      await this.notificationRepo.delete({
        actionId: action.id,
      });

      await this.actionRepo.delete({ id: action.id });
    }

    return true;
  }
}
