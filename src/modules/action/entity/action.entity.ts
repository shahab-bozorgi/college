import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { UserId } from "../../user/model/user-user-id";
import { ActionType } from "../model/action-type";
import { UserEntity } from "../../user/entity/user.entity";
import { User } from "../../user/model/user.model";
import { ActionId } from "../model/action-id";
import { NotificationEntity } from "../notification/entity/notification.entity";
import { Notification } from "../notification/model/notification.model";
import { Media } from "../../media/media.model";
import { MediaEntity } from "../../media/media.entity";
import { UUID } from "../../../data/uuid";

@Entity("actions")
export class ActionEntity {
  @PrimaryColumn("uuid")
  id!: ActionId;

  @Column()
  actorId!: UserId;

  @ManyToOne(() => UserEntity, (actor) => actor.actions)
  actor!: User;

  @Column({ default: null })
  mediaId!: UserId;

  @ManyToOne(() => MediaEntity, (media) => media.actions, {
    onDelete: "SET NULL",
    onUpdate: "SET NULL",
  })
  media!: Media;

  @OneToMany(() => NotificationEntity, (notification) => notification.action)
  notifications!: Notification[];

  @Column()
  type!: ActionType;

  @Column()
  entityId!: UUID;

  @Column()
  actionDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
