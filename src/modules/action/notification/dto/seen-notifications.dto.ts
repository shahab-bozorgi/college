import { z } from "zod";
import { zodNotificationId } from "../model/notification-id";
import { zodUserId } from "../../../user/model/user-user-id";

export const SeenNotificationsSchema = z.object({
  notificationIds: z.array(zodNotificationId),
  receiverId: zodUserId,
});

export type SeenNotificationsDto = z.infer<typeof SeenNotificationsSchema>;
