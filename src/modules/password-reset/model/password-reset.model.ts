import { User } from "../user/model/user.model";
import { PasswordResetToken } from "./model/token";

export interface PasswordReset {
  token: PasswordResetToken;
  user: User;
  expireAt: Date;
}
