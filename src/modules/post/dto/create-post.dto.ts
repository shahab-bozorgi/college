import { z } from "zod";
import { isNoneEmptyString } from "../../../data/non-empty-string";
import { zodMention } from "../field-types/mention";

export const CreatePostSchema = z.object({
  caption: z.string().refine(isNoneEmptyString),
  mentions: zodMention.nullish(),
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
