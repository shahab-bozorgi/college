import {
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../entity/user.entity";
import { UserId } from "../../model/user-user-id";
import { DbFollowingStatus } from "../model/follow.model";
import { FollowId } from "../model/follow-id.model";

@Entity("follows")
@Unique(["followerId", "followingId"])
export class FollowEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: FollowId;

  @PrimaryColumn()
  followerId!: UserId;

  @PrimaryColumn()
  followingId!: UserId;

  @Column()
  followingStatus!: DbFollowingStatus;

  @Column({ default: false })
  isCloseFriend!: boolean;

  @ManyToOne(() => UserEntity, (user) => user.followings)
  @JoinColumn()
  follower!: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.followers)
  @JoinColumn()
  following!: UserEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
