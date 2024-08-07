import { isUUID, UUID } from "../../../data/uuid";
import { Brand } from "../../../utilities/brand";

export type UserId = Brand<UUID, "UserId">;
export const isUserId = (value: string): value is UserId => isUUID(value);
