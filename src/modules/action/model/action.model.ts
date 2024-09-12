import { Int } from "../../../data/int";
import { UUID } from "../../../data/uuid";
import { UserId } from "../../user/model/user-user-id";
import { ActionId } from "./action-id";
import { ActionType } from "./action-type";

export interface Action {
  id: ActionId;
  actorId: UserId;
  type: ActionType;
  entityId: UUID;
}
