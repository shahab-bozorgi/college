import { z } from "zod";
import { Brand } from "../../../utilities/brand";
import { isUUID, UUID } from "../../../data/uuid";

export type ActionId = Brand<UUID, "ActionId">;

export const isActionId = (value: string): value is ActionId =>
  isUUID(value);

export const zodActionId = z.string().refine(isActionId);
