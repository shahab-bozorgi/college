import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from "typeorm";
import { UserEntity } from "../entity/user.entity";
import { UserId } from "../model/user-user-id";

@Entity("follows")
export class FollowEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  followerId!: UserId;

  @Column()
  followingId!: UserId;

  @ManyToOne(() => UserEntity, (user) => user.following)
  @JoinColumn()
  follower!: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.followers)
  @JoinColumn()
  following!: UserEntity;

  // @CreateDateColumn()
  // createdAt!: Date;
}
