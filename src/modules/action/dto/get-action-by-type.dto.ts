import { z } from "zod";
import { zodUUID } from "../../../data/uuid";
import { zodActionType } from "../model/action-type";
import { zodUserId } from "../../user/model/user-user-id";

export const GetActionByTypeSchema = z.object({
  entityId: zodUUID,
  type: zodActionType,
  actorId: zodUserId,
});

export type GetActionByTypeDto = z.infer<typeof GetActionByTypeSchema>;
