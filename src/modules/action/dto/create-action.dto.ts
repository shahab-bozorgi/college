import { z } from "zod";
import { zodUserId } from "../../user/model/user-user-id";
import { zodUUID } from "../../../data/uuid";
import { zodActionType } from "../model/action-type";

export const CreateSchemaAction = z.object({
  type: zodActionType,
  actorId: zodUserId,
  entityId: zodUUID,
});

export type CreateActionDto = z.infer<typeof CreateSchemaAction>;
