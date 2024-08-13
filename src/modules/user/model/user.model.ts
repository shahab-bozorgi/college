import { Email } from "../../../data/email";
import { UserId } from "./user-user-id";
import { Username } from "./user-username";

export interface User {
  id: UserId;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  username: Username;
  password: string;
  email: Email;
  is_private?: boolean;
}

export interface CreateUser {
  username: Username;
  email: Email;
  password: string;
}

export interface UpdateUser extends Partial<Omit<User, "id">> {}

export interface LoginMiddleware {
  id: UserId;
  username: Username;
}

export interface ResetPassword {
  userId: UserId;
  resetToken: string;
  dateTime: Date;
}

export interface UserProfile {
  userId: UserId;
  avatar_url?: string;
  username: Username;
  first_name?: string;
  following: number;
  follower: number;
  posts: number;
  bio?: string;
}
