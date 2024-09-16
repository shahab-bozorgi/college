import { z } from "zod";
import { isUUID, UUID } from "../../../../data/uuid";
import { Brand } from "../../../../utilities/brand";

export type FollowId = Brand<UUID, "FollowId">;

export const isFollowId = (value: string): value is FollowId => isUUID(value);

export const zodFollowId = z.string().refine(isFollowId);
