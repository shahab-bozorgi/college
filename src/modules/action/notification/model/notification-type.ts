import { z } from "zod";

export type NotificationType = "personal" | "friends";

const isNotificationType = (value: string): value is NotificationType => {
  return ["personal", "friends"].includes(value);
};

export const zodNotificationType = z.string().refine(isNotificationType);
