import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { UserId } from "../../../user/model/user-user-id";
import { PostId } from "../../model/post-id";
import { UserEntity } from "../../../user/entity/user.entity";
import { PostEntity } from "../../entity/post.entity";

@Entity("like_posts")
export class LikePostEntity {
  @PrimaryColumn()
  userId!: UserId;

  @PrimaryColumn()
  postId!: PostId;

  @ManyToOne(() => UserEntity, (user) => user.likePosts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.likePosts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  post!: PostEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
