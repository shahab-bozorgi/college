import { BadRequest, NotFound } from "../../../utilities/http-error";
import { UserId } from "../../user/model/user-user-id";
import { UserService } from "../../user/user.service";
import { PostId } from "../model/post-id";
import { PostService } from "../post.service";
import { LikePostDto } from "./dto/like-post-dto";
import { ILikePostRepository } from "./like-post-repository";

export class LikePostService {
  constructor(private likePostRepo: ILikePostRepository) {}

  async likePost(
    dto: LikePostDto,
    userService: UserService,
    postService: PostService
  ) {
    if ((await postService.getPostById(dto.postId)) === null) {
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
    return await this.likePostRepo.create(dto.userId, dto.postId);
  }

  async unLikePost(
    dto: LikePostDto,
    userService: UserService,
    postService: PostService
  ) {
    if ((await postService.getPostById(dto.postId)) === null) {
      throw new NotFound("Post is not found");
    }

    if ((await userService.getUserBy(dto.userId)) === null) {
      throw new NotFound("User is not found");
    }

    await this.likePostRepo.delete(dto.userId, dto.postId);
  }
}
