import { z } from "zod";
import { zodUserId } from "../../user/model/user-user-id";
import { zodUUID } from "../../../data/uuid";
import { zodActionType } from "../model/action-type";
import { zodMedia } from "../../media/model/media-id";

export const CreateSchemaAction = z.object({
  type: zodActionType,
  actorId: zodUserId,
  entityId: zodUUID,
  actionDate: z.coerce.date(),
  mediaId: zodMedia.nullable(),
});

export type CreateActionDto = z.infer<typeof CreateSchemaAction>;
