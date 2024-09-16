import { UserId } from "../../../user/model/user-user-id";
import { PostId } from "../../model/post-id";
import { LikePostId } from "./like-post-id";

export interface LikePost {
  id: LikePostId;
  userId: UserId;
  postId: PostId;
  createdAt: Date;
}

export interface CreateLikePost {
  userId: UserId;
  postId: PostId;
}

export interface DeleteLikePost {
  userId: UserId;
  postId: PostId;
}
