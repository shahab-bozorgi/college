import { BadRequest, NotFound } from "../../../utilities/http-error";
import { CreateActionDto } from "../../action/dto/create-action.dto";
import { ActionNotificationService } from "../../common/service/action-notification.service";
import { MediaId } from "../../media/model/media-id";
import { UserService } from "../../user/user.service";
import { PostService } from "../post.service";
import { LikePostDto } from "./dto/like-post-dto";
import { ILikePostRepository } from "./like-post-repository";

export class LikePostService {
  constructor(private likePostRepo: ILikePostRepository) {}

  async likePost(
    dto: LikePostDto,
    userService: UserService,
    postService: PostService,
    actionNotificationService: ActionNotificationService
  ) {
    const postOfComment = await postService.findPostById(dto.postId, ["media"]);

    if (postOfComment === null) {
      throw new NotFound("Post is not found");
    }

    if ((await userService.getUserBy(dto.userId)) === null) {
      throw new NotFound("User is not found");
    }

    const existingLike = await this.likePostRepo.findLike(
      dto.userId,
      dto.postId
    );

    if (existingLike) {
      throw new BadRequest("You have already liked this post");
    }

    const likePostCreated = await this.likePostRepo.create({
      userId: dto.userId,
      postId: dto.postId,
    });

    let mediaId: MediaId | null = null;
    if (postOfComment.media.length > 0) {
      mediaId = postOfComment.media[0].id;
    }

    const actionDto: CreateActionDto = {
      actorId: likePostCreated.userId,
      type: "likePost",
      entityId: likePostCreated.id,
      actionDate: likePostCreated.createdAt,
      mediaId: mediaId,
    };

    await actionNotificationService.createActionWithNotifications(
      actionDto,
      postOfComment.authorId,
      postOfComment.closeFriendsOnly
    );

    return likePostCreated;
  }

  async unLikePost(
    dto: LikePostDto,
    userService: UserService,
    postService: PostService
  ) {
    if ((await postService.findPostById(dto.postId)) === null) {
      throw new NotFound("Post is not found");
    }

    if ((await userService.getUserBy(dto.userId)) === null) {
      throw new NotFound("User is not found");
    }

    await this.likePostRepo.delete({
      userId: dto.userId,
      postId: dto.postId,
    });
  }
}
