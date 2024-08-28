import { z } from "zod";
import { zodUserId } from "../../model/user-user-id";

export const UnFollowDto = z.object({
  followerId: zodUserId,
  followingId: zodUserId,
});
