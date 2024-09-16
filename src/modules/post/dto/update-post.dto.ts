import { z } from "zod";
import { zodMentionString } from "../mention/dto/mention.dto";
import { zodDeletedMedia } from "../../media/model/media-id";
import { zodBoolean } from "../../../data/boolean";

export const UpdatePostSchema = z.object({
  caption: z.string(),
  mentions: zodMentionString,
  deletedMedia: zodDeletedMedia.nullish(),
  closeFriendsOnly: zodBoolean.optional(),
});

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
