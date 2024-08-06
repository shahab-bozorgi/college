import { z } from "zod";
import { Brand } from "../../../utilities/brand";

export type Username = Brand<string, "Username">;

const isUsername = (value: string): value is Username => {
  const usernamePattern = /^[A-Za-z0-9]{3,}$/;
  return usernamePattern.test(value);
};

export const zodUsername = z.string().refine(isUsername);