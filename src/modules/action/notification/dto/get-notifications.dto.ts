import { z } from "zod";
import { paginationSchema } from "../../../../data/pagination";
import { zodUserId } from "../../../user/model/user-user-id";
import { zodNotificationType } from "../model/notification-type";

export const GetNotificationsSchema = z
  .object({
    notificationType: zodNotificationType,
    receiverId: zodUserId,
  })
  .merge(paginationSchema);

export type GetNotificationsDto = z.infer<typeof GetNotificationsSchema>;
