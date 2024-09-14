import { z } from "zod";
import { zodUserId } from "../../../user/model/user-user-id";
import { zodNotificationType } from "../model/notification-type";

export const countNotificationsByTypeSchema = z.object({
  receiverId: zodUserId,
  notificationType: zodNotificationType,
});

export type countNotificationsByTypeDto = z.infer<
  typeof countNotificationsByTypeSchema
>;