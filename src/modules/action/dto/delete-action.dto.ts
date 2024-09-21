import { z } from "zod";
import { zodUUID } from "../../../data/uuid";
import { zodUserId } from "../../user/model/user-user-id";

export const DeleteActionSchema = z.object({
  entityId: zodUUID,
  actorId: zodUserId,
});

export type DeleteActionDto = z.infer<typeof DeleteActionSchema>;
