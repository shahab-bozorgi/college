import { HttpError, NotFound } from "../../utilities/http-error";
import { User } from "../user/model/user.model";
import { CreatePostDto } from "./dto/create-post.dto";
import { IPostRepository } from "./post.repository";
import { MediaService } from "../media/media.service";
import { parseMention } from "./field-types/mention";
import { UserService } from "../user/user.service";
import { Username } from "../user/model/user-username";
import { extractTag } from "../tag/field-types/tag-title";
import { TagService } from "../tag/tag.service";
import { Tag } from "../tag/tag.model";

export class PostService {
  constructor(
    private postRepo: IPostRepository,
    private mediaService: MediaService
  ) {}

  async create(
    author: User,
    files: any,
    dto: CreatePostDto,
    userService: UserService,
    tagService: TagService
  ): Promise<void> {
    if (!Array.isArray(files) || (Array.isArray(files) && !files.length))
      throw new HttpError(400, "Post must include at least one picture");

    let mentions: User[] = [];
    if (dto.mentions) {
      const mentionedUsers = parseMention(dto.mentions);
      mentions = await userService.whereUsernameIn(mentionedUsers);
      this.validateMentions(mentionedUsers, author, mentions);
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

    let tags: Tag[] = [];
    const extractedTags = extractTag(dto.caption);
    if (extractedTags.length) {
      tags = await tagService.insert(extractedTags);
    }

    await this.postRepo.create({
      author,
      caption: dto.caption,
      media,
      mentions,
      tags,
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
      throw new NotFound(`No users were found by ${notFound}`);
    }
  }
}
