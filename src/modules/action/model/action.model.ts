import { UUID } from "../../../data/uuid";
import { MediaId } from "../../media/model/media-id";
import { UserId } from "../../user/model/user-user-id";
import { ActionId } from "./action-id";
import { ActionType } from "./action-type";

export interface Action {
  id: ActionId;
  mediaId: MediaId;
  actorId: UserId;
  type: ActionType;
  entityId: UUID;
}
