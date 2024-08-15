import { z } from "zod";

export const FollowRequestDto = z.object({
  targetUserId: z.string().uuid(),
});

export const FollowResponseDto = z.object({
  followersCount: z.number().nonnegative(), 
  followingCount: z.number().nonnegative(), 
  isFollowing: z.boolean(), 
});


export type FollowResponseDtoType = z.infer<typeof FollowResponseDto>;
export type FollowRequestDtoType = z.infer<typeof FollowRequestDto>;
