import { z } from "zod";
import { zodMention } from "../model/mention";
import { zodDeletedMedia } from "../../media/field-types/media-id";
import { isNoneEmptyString } from "../../../data/non-empty-string";

export const UpdatePostSchema = z.object({
  caption: z.string().refine(isNoneEmptyString).nullish(),
  mentions: zodMention.nullish(),
  deletedMedia: zodDeletedMedia.nullish(),
});

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
