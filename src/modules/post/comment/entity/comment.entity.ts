// import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
// import { CommentId } from "../model/comment-id";
// import { NoneEmptyString } from "../../../../data/non-empty-string";


// @Entity("comments")
// export class CommentEntity {
//   @PrimaryColumn("uuid")
//   id!: CommentId;

//   @Column()
//   description!: NoneEmptyString;

//   @OneToMany(() => LikeCommentEntity, (likeComment) => likeComment.userId)
//   likeComments!: LikeCommentEntity[];

//   @CreateDateColumn()
//   createdAt!: Date;

//   @UpdateDateColumn()
//   updatedAt!: Date;
// }