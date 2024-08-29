import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Email } from "../../../data/email";
import { Username } from "../model/user-username";
import { Password } from "../model/user-password";
import { UserId } from "../model/user-user-id";
import { FollowEntity } from "../follow/entity/follow.entity";
import { MediaEntity } from "../../media/media.entity";
import { PostEntity } from "../../post/entity/post.entity";
import { CommentEntity } from "../../post/comment/entity/comment.entity";
import { LikeCommentEntity } from "../../post/comment/like-comment/entity/like-comment.entity";
import { BookmarkEntity } from "../../post/bookmark/entity/bookmark.entity";

@Entity("users")
export class UserEntity {
  @PrimaryColumn("uuid")
  id!: UserId;

  @Column({ nullable: true })
  first_name!: string;

  @Column({ nullable: true })
  last_name!: string;

  @Column({ unique: true })
  email!: Email;

  @Column({ unique: true })
  username!: Username;

  @Column()
  password!: Password;

  @Column({ nullable: true })
  bio!: string;

  @Column({ default: false })
  is_private!: boolean;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts!: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments!: CommentEntity[];

  @OneToMany(() => LikeCommentEntity, (likeComment) => likeComment.user)
  likeComments!: LikeCommentEntity[];

  @OneToOne(() => MediaEntity, { onDelete: "SET NULL" })
  @JoinColumn()
  avatar!: MediaEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following!: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  followers!: FollowEntity[];

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post)
  bookmarks!: BookmarkEntity[];
}
