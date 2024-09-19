import { z } from "zod";
import { zodUUID } from "../../../data/uuid";
import { zodUserId } from "../../user/model/user-user-id";

export const UpdateActionSchema = z.object({
  entityId: zodUUID,
  actorId: zodUserId,
  actionDate: z.coerce.date(),
});

export type UpdateActionDto = z.infer<typeof UpdateActionSchema>;
