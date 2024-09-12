import { DataSource, Repository } from "typeorm";
import { NotificationEntity } from "./entity/notification.entity";
import { GetNotificationsDto } from "./dto/get-notifications.dto";
import {
  PaginatedResult,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";
import { CommentRepository } from "../../post/comment/comment.repository";
import { CommentId } from "../../post/comment/model/comment-id";
import { ActionType } from "../model/action-type";
import { UUID } from "../../../data/uuid";
import { ShowNotification } from "./model/notification.model";

export interface INotificationRepository {
  getAllWithAction(
    dto: GetNotificationsDto
  ): Promise<PaginatedResult<{ notifications: NotificationEntity[] }>>;
  getRelatedEntityByType(
    actionType: ActionType,
    entityId: UUID
  ): Promise<unknown | null>;
}

export class NotificationRepository implements INotificationRepository {
  private repo: Repository<NotificationEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(NotificationEntity);
  }

  async getAllWithAction(
    dto: GetNotificationsDto
  ): Promise<PaginatedResult<{ notifications: NotificationEntity[] }>> {
    const result = await this.repo
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.action", "action")
      .select([
        "notification.id",
        "action.type",
        "action.actorId",
        "action.entityId",
        "notification.receiverId",
        "notification.isSeen",
      ])
      .where("notification.receiverId = :receiverId", {
        receiverId: dto.receiverId,
      })
      .andWhere("notification.notificationType = :notificationType", {
        notificationType: dto.notificationType,
      })
      .take(dto.limit)
      .skip(paginationSkip({ limit: dto.limit, page: dto.page }))
      .getManyAndCount();

    const { nextPage, totalPages } = paginationInfo(result[1], {
      limit: dto.limit,
      page: dto.page,
    });

    return { notifications: result[0], nextPage, totalPages };
  }

  async getRelatedEntityByType(
    actionType: ActionType,
    entityId: UUID
  ): Promise<unknown | null> {
    switch (actionType) {
      case "comment":
        const commentRepo = new CommentRepository(this.dataSource);
        return await commentRepo.getCommentForNotificationById(
          entityId as CommentId
        );

      default:
        return null;
    }
  }
}
