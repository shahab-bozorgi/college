import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { UserEntity } from "../entity/user.entity";

@Entity("follows")
export class FollowEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.following)
  @JoinColumn({ name: "follower_id" })
  follower!: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.followers)
  @JoinColumn({ name: "following_id" })
  following!: UserEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
