import { NoneEmptyString } from "../../../../data/non-empty-string";
import { UserId } from "../../../user/model/user-user-id";
import { PostId } from "../../model/post-id";
import { LikeComment } from "../like-comment/model/like-comment.model";
import { CommentId } from "./comment-id";

export interface Comment {
  id: CommentId;
  postId: PostId;
  userId: UserId;
  parentId: CommentId | null;
  description: NoneEmptyString;
}

export interface CreateComment {
  postId: PostId;
  userId: UserId;
  parentId: CommentId | null;
  description: NoneEmptyString;
}
