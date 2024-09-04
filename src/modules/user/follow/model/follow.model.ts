import { Media } from "../../../media/media.model";
import { UserId } from "../../model/user-user-id";
import { Username } from "../../model/user-username";

export type RequestStatus = "pending" | "accepted";

export interface Follow {
  followerId: UserId;
  followingId: UserId;
  requestStatus: RequestStatus;
}

export interface CreateFollow {
  followerId: UserId;
  followingId: UserId;
  requestStatus: RequestStatus;
}

export interface DeleteFollow {
  followerId: UserId;
  followingId: UserId;
}

export interface UpdateFollow {
  followerId: UserId;
  followingId: UserId;
  requestStatus: RequestStatus;
}

interface UserInFollowList {
  id: UserId;
  firstName: string;
  lastName: string;
  username: Username;
  avatar: Media;
  followersCount: number;
}

export interface FollowingsList {
  followings: UserInFollowList[];
}

export interface FollowersList {
  followers: UserInFollowList[];
}
