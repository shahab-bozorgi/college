import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { UserId } from "../../user/model/user-user-id";
import { Int } from "../../../data/int";
import { UUID } from "../../../data/uuid";
import { ActionType } from "../model/action-type";
import { UserEntity } from "../../user/entity/user.entity";
import { User } from "../../user/model/user.model";
import { ActionId } from "../model/action-id";
import { NotificationEntity } from "../notification/entity/notification.entity";
import { Notification } from "../notification/model/notification.model";

@Entity("actions")
export class ActionEntity {
  @PrimaryColumn("uuid")
  id!: ActionId;

  @Column()
  actorId!: UserId;

  @ManyToOne(() => UserEntity, (actor) => actor.actions)
  actor!: User;

  @OneToMany(() => NotificationEntity, (notification) => notification.action)
  notifications!: Notification[];

  @Column()
  type!: ActionType;

  @Column()
  entityId!: UUID;

  @CreateDateColumn()
  createdAt!: Date;
}
