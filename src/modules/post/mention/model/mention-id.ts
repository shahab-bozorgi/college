import { z } from "zod";
import { Brand } from "../../../../utilities/brand";
import { isUUID, UUID } from "../../../../data/uuid";

export type MentionId = Brand<UUID, "MentionId">;

export const isMentionId = (value: string): value is MentionId =>
  isUUID(value);

export const zodMentionId = z.string().refine(isMentionId);
