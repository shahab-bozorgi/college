import { z } from "zod";
import { zodMentionString } from "../model/mention";
import { zodDeletedMedia } from "../../media/field-types/media-id";

export const UpdatePostSchema = z.object({
  caption: z.string(),
  mentions: zodMentionString,
  deletedMedia: zodDeletedMedia.nullish(),
});

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
