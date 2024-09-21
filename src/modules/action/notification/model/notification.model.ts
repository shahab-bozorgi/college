import { UUID } from "../../../../data/uuid";
import { Media } from "../../../media/model/media.model";
import { UserId } from "../../../user/model/user-user-id";
import { Username } from "../../../user/model/user-username";
import { ActionId } from "../../model/action-id";
import { ActionType } from "../../model/action-type";
import { NotificationId } from "./notification-id";
import { NotificationType } from "./notification-type";

export interface Notification {
  id: NotificationId;
  actionId: ActionId;
  receiverId: UserId;
  notificationType: NotificationType;
  isSeen: boolean;
}

export interface CreateNotification {
  actionId: ActionId;
  receiverId: UserId;
  notificationType: NotificationType;
  isSeen: boolean;
}

export interface ShowNotification {
  id: NotificationId;
  actionType: ActionType;
  media: Media | null;
  actionDate: Date;
  actor: {
    id: UserId;
    username: Username;
    firstName: string;
    lastName: string;
    followingStatus: "Pending" | "Blocked" | "Following" | "NotFollowing";
    followedStatus: "Pending" | "Blocked" | "Following" | "NotFollowing";
  };
  isSeen: boolean;
  content?: {
    [key in ActionType]?: unknown;
  };
}
