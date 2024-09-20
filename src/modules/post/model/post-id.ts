import { z } from "zod";
import { Brand } from "../../../utilities/brand";
import { isUUID, UUID } from "../../../data/uuid";

export type PostId = Brand<UUID, "PostId">;

export const isPostId = (value: string): value is PostId => isUUID(value);

export const zodPostId = z.string().refine(isPostId);
