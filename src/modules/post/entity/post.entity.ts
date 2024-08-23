import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { PostId } from "../model/post-id";
import { UserEntity } from "../../user/entity/user.entity";
import { MediaEntity } from "../../media/media.entity";
import { NoneEmptyString } from "../../../data/non-empty-string";
import { TagEntity } from "../../tag/tag.entity";
import { UserId } from "../../user/model/user-user-id";

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

  @ManyToMany(() => UserEntity)
  @JoinTable()
  mentions!: UserEntity[];

  @ManyToMany(() => MediaEntity)
  @JoinTable()
  media!: MediaEntity[];

  @ManyToMany(() => TagEntity)
  @JoinTable()
  tags!: TagEntity[];
}
