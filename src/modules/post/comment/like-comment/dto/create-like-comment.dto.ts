import { z } from "zod";
import { zodUserId } from "../../../../user/model/user-user-id";
import { zodCommentId } from "../../model/comment-id";

export const CreateLikeCommentSchema = z.object({
  userId: zodUserId,
  commentId: zodCommentId,
});

export type CreateLikeCommentDto = z.infer<typeof CreateLikeCommentSchema>;
