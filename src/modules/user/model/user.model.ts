import { Email } from "../../../data/email";
import { UUID } from "../../../data/uuid";
import { Password } from "./user-password";
import { Username } from "./user-username";

export interface User {
  id: UUID;
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio: string;
  username: Username;
  password: Password;
  email: Email;
  is_private: boolean;
}

export interface CreateUser{
  username:string;
  email: string;
  password: string;
}

