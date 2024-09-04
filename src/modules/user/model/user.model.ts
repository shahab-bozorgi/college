import { Email } from "../../../data/email";
import { UserId } from "./user-user-id";
import { Username } from "./user-username";
import { Media } from "../../media/media.model";

export type FollowingStatus = "Followed" | "NotFollowed" | "PendingApproval";

export interface User {
  id: UserId;
  first_name?: string;
  last_name?: string;
  avatar?: Media;
  bio?: string;
  username: Username;
  password: string;
  email: Email;
  is_private?: boolean;
  followersCount?: number;
  followingsCount?: number;
}

export interface CreateUser {
  username: Username;
  email: Email;
  password: string;
}

export interface UpdateUser {
  first_name?: string;
  last_name?: string;
  bio?: string;
  password?: string;
  email?: Email;
  is_private?: boolean;
  avatar?: Media;
}

export interface ResetPassword {
  userId: UserId;
  resetToken: string;
  dateTime: Date;
}

export interface BaseProfile {
  id: UserId;
  avatar?: Media;
  username: Username;
  isPrivate?: boolean;
  firstName?: string;
  lastName?: string;
  followingsCount?: number;
  followersCount?: number;
  postsCount: number;
  bio?: string;
}

export interface AuthenticatedUserProfile extends BaseProfile {
  email: Email;
}

export interface OtherUserProfile extends BaseProfile {
  followingStatus: FollowingStatus;
}
