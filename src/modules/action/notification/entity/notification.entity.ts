import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { NotificationId } from "../model/notification-id";
import { UserId } from "../../../user/model/user-user-id";
import { UserEntity } from "../../../user/entity/user.entity";
import { User } from "../../../user/model/user.model";
import { ActionId } from "../../model/action-id";
import { ActionEntity } from "../../entity/action.entity";
import { Action } from "../../model/action.model";
import { NotificationType } from "../model/notification-type";

@Entity("notifications")
export class NotificationEntity {
  @PrimaryColumn("uuid")
  id!: NotificationId;

  @Column()
  actionId!: ActionId;

  @ManyToOne(() => ActionEntity, (action) => action.notifications)
  action!: Action;

  @Column()
  receiverId!: UserId;

  @ManyToOne(() => UserEntity, (receiver) => receiver.notifications)
  receiver!: User;

  @Column()
  notificationType!: NotificationType;

  @Column({ default: false })
  isSeen!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
