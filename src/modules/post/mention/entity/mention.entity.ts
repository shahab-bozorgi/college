import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { UserId } from "../../../user/model/user-user-id";
import { PostId } from "../../model/post-id";
import { UserEntity } from "../../../user/entity/user.entity";
import { PostEntity } from "../../entity/post.entity";
import { Username } from "../../../user/model/user-username";
import { MentionId } from "../model/mention-id";

@Entity("mentions")
@Unique(["userId", "postId"])
export class MentionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: MentionId;

  @PrimaryColumn()
  userId!: UserId;

  @PrimaryColumn()
  postId!: PostId;

  @Column()
  username!: Username;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.mentions)
  user!: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.mentions)
  post!: PostEntity;
}
