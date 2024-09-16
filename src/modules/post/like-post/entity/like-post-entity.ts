import {
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
import { LikePostId } from "../model/like-post-id";

@Entity("like_posts")
@Unique(["userId", "postId"])
export class LikePostEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: LikePostId;

  @PrimaryColumn()
  userId!: UserId;

  @PrimaryColumn()
  postId!: PostId;

  @ManyToOne(() => UserEntity, (user) => user.likePosts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.likes, {
    nullable: false,
    onDelete: "CASCADE",
  })
  post!: PostEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
