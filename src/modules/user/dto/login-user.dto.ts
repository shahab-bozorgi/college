import { z } from "zod";
import { zodPassword } from "../model/user-password";
import { zodUsername } from "../model/user-username";

export const loginUserDto = z.object({
  username: zodUsername,
  password: zodPassword,
});

export type LoginUserDto = z.infer<typeof loginUserDto>;
