import { z } from "zod";
import { Brand } from "../../../utilities/brand";
import { isUUID } from "../../../data/uuid";

export type PostId = Brand<string, "PostId">;

export const isPostId = (value: string): value is PostId => isUUID(value);

export const zodPostId = z.string().refine(isPostId);