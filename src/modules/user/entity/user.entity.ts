import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Email } from "../../../data/email";
import { Username } from "../model/user-username";
import { Password } from "../model/user-password";
import { UserId } from "../model/user-user-id";
import { FollowEntity } from "./follow.entity";
import { MediaEntity } from "../../media/media.entity";
import { PostEntity } from "../../post/post.entity";

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

  @OneToOne(() => MediaEntity)
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

  @Column({ default: 0 })
  followingCount!: number;

  @Column({ default: 0 })
  followersCount!: number;
}
