import { z } from "zod";
import { zodActionId } from "../../model/action-id";
import { zodUserId } from "../../../user/model/user-user-id";

export const CreateSchemaNotification = z.object({
  actionId: zodActionId,
  receiverId: zodUserId,
  isSeen: z.boolean(),
});

export type CreateNotificationDto = z.infer<typeof CreateSchemaNotification>;
