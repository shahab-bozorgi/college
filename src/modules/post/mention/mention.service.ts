import { PaginatedResult, PaginationDto } from "../../../data/pagination";
import { BadRequest, HttpError, NotFound } from "../../../utilities/http-error";
import { FollowService } from "../../user/follow/follow.service";
import { UserId } from "../../user/model/user-user-id";
import { Username } from "../../user/model/user-username";
import { User } from "../../user/model/user.model";
import { UserService } from "../../user/user.service";
import { MentionString } from "./dto/mention.dto";
import { PostId } from "../model/post-id";
import { ShowPosts } from "../model/post.model";
import { IMentionRepository } from "./mention.repository";
import { DeleteMention } from "./model/mention.model";

export class MentionService {
  constructor(
    private mentionRepo: IMentionRepository,
    private userService: UserService,
    private followService: FollowService
  ) {}

  async insert(postId: PostId, mentionedUsers: User[]): Promise<void> {
    await this.mentionRepo.insert(
      mentionedUsers.map((user) => {
        return { userId: user.id, username: user.username, postId: postId };
      })
    );
  }

  async deleteMentions(mention: DeleteMention[]): Promise<boolean> {
    return await this.mentionRepo.delete(
      mention.map((mention) => {
        return { postId: mention.postId, userId: mention.userId };
      })
    );
  }

  async getPostsMentioningUser(
    authenticatedId: UserId,
    paginationDto: PaginationDto
  ): Promise<PaginatedResult<ShowPosts>> {
    return await this.mentionRepo.postsMentioningUser(
      authenticatedId,
      paginationDto
    );
  }

  async validateMentions(
    mentionString: MentionString,
    author: User
  ): Promise<User[]> {
    const parsedMentions = this.parseMention(mentionString);
    if (parsedMentions.includes(author.username.toLowerCase() as Username))
      throw new HttpError(400, "You cannot mention yourself.");

    const mentionedUsers = await this.userService.whereUsernameIn(
      parsedMentions
    );
    if (mentionedUsers.length !== parsedMentions.length) {
      const notFound = parsedMentions
        .filter(
          (username) =>
            !mentionedUsers.find(
              (user) => user.username.toLowerCase() === username
            )
        )
        .join(" ");
      throw new NotFound(`No users were found by ${notFound}`);
    }

    const blockedByAuthor = (
      await this.followService.findWhereUserHasBlocked(author.id)
    ).map((followRecord) => followRecord.followerId);
    const authorBlocked = (
      await this.followService.findWhereUserIsBlocked(author.id)
    ).map((followRecord) => followRecord.followingId);
    mentionedUsers.forEach((user) => {
      if (blockedByAuthor.includes(user.id))
        throw new BadRequest(
          `You cannot mention ${user.username}. ${user.username} is in you blacklist.`
        );
      if (authorBlocked.includes(user.id))
        throw new BadRequest(
          `You cannot mention ${user.username}. ${user.username} has blocked you.`
        );
    });

    return mentionedUsers;
  }

  private parseMention(value: MentionString): Username[] {
    return value
      .trim()
      .split(" ")
      .filter(
        (mention, i, mentions) =>
          mentions.findIndex((val) => mention === val) === i
      )
      .map((mention) => mention.slice(1).toLowerCase() as Username);
  }
}
