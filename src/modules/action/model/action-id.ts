import { z } from "zod";
import { Brand } from "../../../utilities/brand";
import { isUUID } from "../../../data/uuid";
import { UUID } from "crypto";

export type ActionId = Brand<UUID, "ActionId">;

export const isActionId = (value: string): value is ActionId =>
  isUUID(value);

export const zodActionId = z.string().refine(isActionId);
