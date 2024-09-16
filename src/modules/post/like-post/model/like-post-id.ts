import { z } from "zod";
import { Brand } from "../../../../utilities/brand";
import { isUUID, UUID } from "../../../../data/uuid";

export type LikePostId = Brand<UUID, "LikePostId">;

export const isLikePostId = (value: string): value is LikePostId =>
  isUUID(value);

export const zodLikePostId = z.string().refine(isLikePostId);
