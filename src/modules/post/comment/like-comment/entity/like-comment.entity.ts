import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from "typeorm";
import { CommentId } from "../../model/comment-id";
import { UserId } from "../../../../user/model/user-user-id";
import { UserEntity } from "../../../../user/entity/user.entity";
import { CommentEntity } from "../../entity/comment.entity";

@Entity("like_comments")
export class LikeCommentEntity {
  @Column()
  userId!: UserId;

  @Column()
  commentId!: CommentId;

  @ManyToOne(() => UserEntity, (user) => user.likeComments, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: UserEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.likeComments, {
    nullable: false,
    onDelete: "CASCADE",
  })
  comment!: CommentEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
