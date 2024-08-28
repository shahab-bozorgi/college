import { UserId } from "../../model/user-user-id";
import { Username } from "../../model/user-username";

export interface Following {
  id: UserId;
  avatar: string | null;
  username: Username;
  first_name: string;
  last_name: string;
  bio: string;
  followersCount: number;
}
