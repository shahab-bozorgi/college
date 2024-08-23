import { z } from "zod";
import { zodPostId } from "../../model/post-id";
import { zodInt } from "../../../../data/int";

export const GetCommentsSchema = z.object({
  postId: zodPostId,
  skip: zodInt,
  take: zodInt,
});

export type GetCommentsDto = z.infer<typeof GetCommentsSchema>;
