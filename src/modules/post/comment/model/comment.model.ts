import { NoneEmptyString } from "../../../../data/non-empty-string";
import { UserId } from "../../../user/model/user-user-id";
import { PostId } from "../../model/post-id";
import { CommentId } from "./comment-id";

export interface Comment {
  id: CommentId;
  postId: PostId;
  userId: UserId;
  parentId: CommentId | null;
  description: NoneEmptyString;
  createdAt: Date;
  replies: Comment[];
  likeCommentsCount: number;
}

export interface CreateComment {
  postId: PostId;
  userId: UserId;
  parentId: CommentId | null;
  description: NoneEmptyString;
  createdAt: Date;
}
