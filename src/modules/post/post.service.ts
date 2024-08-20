import { HttpError, NotFound } from "../../utilities/http-error";
import { User } from "../user/model/user.model";
import { CreatePostDto } from "./dto/create-post.dto";
import { IPostRepository } from "./post.repository";
import { MediaService } from "../media/media.service";
import { parseMention } from "./field-types/mention";
import { UserService } from "../user/user.service";
import { Username } from "../user/model/user-username";

export class PostService {
  constructor(
    private postRepo: IPostRepository,
    private mediaService: MediaService
  ) {}

  async create(
    author: User,
    files: any,
    dto: CreatePostDto,
    userService: UserService
  ): Promise<void> {
    if (!Array.isArray(files) || (Array.isArray(files) && !files.length))
      throw new HttpError(400, "Post must include at least one picture");

    let mentionedUsers: User[] = [];
    if (dto.mentions) {
      const mentions = parseMention(dto.mentions);
      mentionedUsers = await userService.whereUsernameIn(mentions);
      this.validateMentions(mentions, author, mentionedUsers);
    }

    const media = await this.mediaService.insert(
      files.map((md) => {
        return {
          name: md.filename,
          mime: md.mimetype,
          size: md.size,
          path: md.path,
        };
      })
    );

    await this.postRepo.create({
      author,
      caption: dto.caption,
      media: media,
      mentions: mentionedUsers,
    });
  }

  private validateMentions(
    mentions: Username[],
    author: User,
    users: User[]
  ): void {
    if (mentions.includes(author.username.toLowerCase() as Username))
      throw new HttpError(400, "You cannot mention yourself.");
    if (users.length !== mentions.length) {
      const foundUsers = users.map((user) => user.username.toLowerCase());
      const notFound = mentions
        .filter((mention) => !foundUsers.includes(mention))
        .map((mention) => `@${mention}`)
        .join(" ");
      throw new NotFound(`No Users were found by ${notFound}`);
    }
  }

  async getPostsCount(author: User): Promise<number> {
    return await this.postRepo.postsCount(author);
  }
}
