import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { PostId } from "../model/post-id";
import { UserEntity } from "../../user/entity/user.entity";
import { MediaEntity } from "../../media/media.entity";
import { NoneEmptyString } from "../../../data/non-empty-string";
import { TagEntity } from "../../tag/tag.entity";
import { UserId } from "../../user/model/user-user-id";
import { CommentEntity } from "../comment/entity/comment.entity";
import { BookmarkEntity } from "../bookmark/entity/bookmark.entity";

@Entity("posts")
export class PostEntity {
  @PrimaryColumn("uuid")
  id!: PostId;

  @Column()
  authorId!: UserId;

  @ManyToOne(() => UserEntity, (author) => author.posts, { nullable: false })
  author!: UserEntity;

  @Column("text")
  caption!: NoneEmptyString;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  mentions!: UserEntity[];

  @ManyToMany(() => MediaEntity)
  @JoinTable()
  media!: MediaEntity[];

  @ManyToMany(() => TagEntity)
  @JoinTable()
  tags!: TagEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments!: CommentEntity[];

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post)
  bookmarks!: BookmarkEntity[];
}
