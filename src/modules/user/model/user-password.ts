import { z } from "zod";
import { Brand } from "../../../utilities/brand";

export type Password = Brand<string, "Password">;

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;

const isPassword = (value: string): value is Password => {
  return passwordPattern.test(value);
};

export const zodPassword = z.string().refine(isPassword);
