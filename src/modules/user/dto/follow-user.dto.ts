import { z } from "zod";


export const UserListsDto = z.object({
  id: z.string().uuid(),
  avatar: z.string().nullable(),
  username: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  bio: z.string().nullable(),
  followersCount: z.number().nonnegative(),
});

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
export type UserListsDtoType = z.infer<typeof UserListsDto>;