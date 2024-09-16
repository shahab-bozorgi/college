import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { PasswordResetToken } from "../model/token";
import { UserEntity } from "../../user/entity/user.entity";
import { User } from "../../user/model/user.model";

@Entity("password_resets")
export class PasswordResetEntity {
  @PrimaryColumn({ length: 64 })
  token!: PasswordResetToken;

  @ManyToOne(() => UserEntity, undefined, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: User;

  @Column()
  expireAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
