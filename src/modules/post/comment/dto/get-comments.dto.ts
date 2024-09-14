import { z } from "zod";
import { zodPostId } from "../../model/post-id";
import { paginationSchema } from "../../../../data/pagination";
import { zodUserId } from "../../../user/model/user-user-id";

export const GetCommentsSchema = z
  .object({
    authenticatedUserId: zodUserId,
    postId: zodPostId,
  })
  .merge(paginationSchema);

export type GetCommentsDto = z.infer<typeof GetCommentsSchema>;
