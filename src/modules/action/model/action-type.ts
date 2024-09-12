import { z } from "zod";

export type ActionType =
  | "follow"
  | "requestFollow"
  | "acceptFollow"
  | "comment"
  | "likePost"
  | "mention";

const isActionType = (value: string): value is ActionType => {
  return [
    "follow",
    "requestFollow",
    "acceptFollow",
    "comment",
    "likePost",
    "mention",
  ].includes(value);
};

export const zodActionType = z.string().refine(isActionType);
