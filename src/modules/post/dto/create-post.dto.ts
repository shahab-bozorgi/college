import { z } from "zod";
import { zodMentionString } from "../model/mention";

export const CreatePostSchema = z.object({
  caption: z.string(),
  mentions: zodMentionString,
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
