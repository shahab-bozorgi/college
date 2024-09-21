import { z } from "zod";
import { zodUUID } from "../../../data/uuid";
import { zodUserId } from "../../user/model/user-user-id";
import { zodMediaId } from "../../media/model/media-id";

export const UpdateActionSchema = z.object({
  entityId: zodUUID,
  actorId: zodUserId,
  actionDate: z.coerce.date(),
  mediaId: zodMediaId.nullable(),
});

export type UpdateActionDto = z.infer<typeof UpdateActionSchema>;
