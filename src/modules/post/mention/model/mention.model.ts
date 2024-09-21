import { UserId } from "../../../user/model/user-user-id";
import { Username } from "../../../user/model/user-username";
import { PostId } from "../../model/post-id";
import { MentionId } from "./mention-id";

export interface Mention {
  id: MentionId;
  userId: UserId;
  postId: PostId;
  username: Username;
  createdAt: Date;
}

export interface CreateMention {
  userId: UserId;
  postId: PostId;
  username: Username;
}

export interface DeleteMention {
  userId: UserId;
  postId: PostId;
}

export interface MentionNotification {
  user: {
    id: UserId;
    username: Username;
    firstName: string;
    lastName: string;
  };
}
