import { z } from "zod";
import { zodUserId } from "../../model/user-user-id";

export const deleteFollowerSchema = z.object({
  followerId: zodUserId,
});
