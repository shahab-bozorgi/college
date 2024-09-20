import { z } from "zod";
import { Brand } from "../../../../utilities/brand";
import { isUUID, UUID } from "../../../../data/uuid";

export type NotificationId = Brand<UUID, "NotificationId">;

export const isNotificationId = (value: string): value is NotificationId =>
  isUUID(value);

export const zodNotificationId = z.string().refine(isNotificationId);
