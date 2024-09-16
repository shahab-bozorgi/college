import { z } from "zod";
import { Brand } from "../../../../utilities/brand";
import { isUUID } from "../../../../data/uuid";

export type MentionId = Brand<string, "MentionId">;

export const isMentionId = (value: string): value is MentionId => isUUID(value);

export const zodMedia = z.string().refine(isMentionId);

export const zodDeletedMedia = z.array(
  z.string().refine(isMentionId, { message: "Media id is invalid" })
);
