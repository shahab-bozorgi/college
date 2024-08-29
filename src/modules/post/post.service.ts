import {
  BadRequest,
  Forbidden,
  HttpError,
  NotFound,
} from "../../utilities/http-error";
import { User } from "../user/model/user.model";
import { CreatePostDto } from "./dto/create-post.dto";
import { IPostRepository } from "./post.repository";
import { MediaService } from "../media/media.service";
import { parseMention } from "./model/mention";
import { UserService } from "../user/user.service";
import { Username } from "../user/model/user-username";
import { extractTag } from "../tag/field-types/tag-title";
import { TagService } from "../tag/tag.service";
import { Tag } from "../tag/tag.model";
import { isPostId, PostId } from "./model/post-id";
import { UpdatePostDto } from "./dto/update-post.dto";
import { MIME } from "../media/field-types/mime";
import { NoneEmptyString } from "../../data/non-empty-string";
import { UserId } from "../user/model/user-user-id";
import { Post, ShowPost, ShowPosts } from "./model/post.model";

export class PostService {
  constructor(
    private postRepo: IPostRepository,
    private mediaService: MediaService
  ) {}

  async getPosts(
    author: User,
    skip: number,
    limit: number
  ): Promise<ShowPosts[]> {
    return await this.postRepo.findManyByAuthor(author.id, skip, limit);
  }

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

  async getPost(
    postId: string,
    viewer: User,
    userService: UserService
  ): Promise<ShowPost> {
    if (!isPostId(postId)) throw new BadRequest("Invalid post ID.");
    const post = await this.postRepo.findById(postId, [
      "media",
      "mentions",
      "tags",
      "author",
      "bookmarks",
    ]);
    if (!post) throw new NotFound("Post not found");
    const avatar = (await userService.getUserBy(post.authorId, ["avatar"]))
      ?.avatar;
    return {
      id: post.id,
      caption: post.caption,
      author: {
        first_name: post.author.first_name,
        last_name: post.author.last_name,
        username: post.author.username,
        avatar,
      },
      tags: post.tags.map((tag) => tag.title),
      mentions: post.mentions.map((mention) => mention.username),
      media: post.media,
      isBookmarked: post.bookmarks.some((bk) => bk.userId === viewer.id),
      bookmarksCount: post.bookmarks.length,
      likesCount: 0,
      commentsCount: 0,
      createdAt: post.createdAt,
    };
  }

  async update(
    postId: PostId,
    authorId: UserId,
    dto: UpdatePostDto,
    userService: UserService,
    tagService: TagService,
    files?: Express.Multer.File[]
  ): Promise<void> {
    const post = await this.postRepo.findById(postId, [
      "author",
      "tags",
      "mentions",
      "media",
    ]);

    if (!post) throw new NotFound("Post not found");

    if (post.author.id !== authorId) throw new Forbidden("Access Forbidden");

    if (dto.caption) {
      post.caption = dto.caption;
      post.tags = await tagService.insert(extractTag(dto.caption));
    }

    if (!dto.mentions) {
      post.mentions = [];
    } else {
      const mentionedUsers = parseMention(dto.mentions);
      post.mentions = await userService.whereUsernameIn(mentionedUsers);
      this.validateMentions(mentionedUsers, post.author, post.mentions);
    }

    const deletedMedia = dto.deletedMedia;
    if (deletedMedia) {
      const postMediaIds = post.media.map((md) => md.id);
      if (deletedMedia.find((dm) => !postMediaIds.includes(dm)))
        throw new BadRequest("Wrong media ids to delete.");

      const remainingMedia = post.media.filter(
        (md) => !deletedMedia.includes(md.id)
      );
      if (!remainingMedia.length && (!files || (files && !files.length)))
        throw new BadRequest("You cannot delete all of the post's media.");

      await this.mediaService.delete(deletedMedia);
      post.media = remainingMedia;
    }

    if (files && files.length) {
      post.media = post.media.concat(
        await this.mediaService.insert(
          files.map((file) => {
            return {
              name: file.filename as NoneEmptyString,
              mime: file.mimetype as MIME,
              size: file.size,
              path: file.path,
            };
          })
        )
      );
    }

    await this.postRepo.update(post);
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

  async getPostsCount(author: User): Promise<number> {
    return await this.postRepo.postsCount(author);
  }

  async findPostById(id: PostId): Promise<Post | null> {
    return await this.postRepo.findById(id);
  }
}
