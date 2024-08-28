import { UserId } from "../../model/user-user-id";

export type RequestStatus = "pending" | "accepted";

export interface Follow {
  followerId: UserId;
  followingId: UserId;
  requestStatus: RequestStatus;
}

export interface CreateFollow {
  followerId: UserId;
  followingId: UserId;
  requestStatus: RequestStatus;
}

export interface DeleteFollow {
  followerId: UserId;
  followingId: UserId;
}