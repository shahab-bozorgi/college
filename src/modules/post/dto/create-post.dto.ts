import { z } from "zod";
import { zodMentionString } from "../mention/dto/mention.dto";
import { zodBoolean } from "../../../data/boolean";

export const CreatePostSchema = z.object({
  caption: z.string(),
  mentions: zodMentionString,
  closeFriendsOnly: zodBoolean.default(false),
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
