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
import { UserService } from "../user/user.service";
import { Username } from "../user/model/user-username";
import { extractTag } from "../tag/field-types/tag-title";
import { TagService } from "../tag/tag.service";
import { Tag } from "../tag/tag.model";
import { isPostId, PostId } from "./model/post-id";
import { UpdatePostDto } from "./dto/update-post.dto";
import { MIME } from "../media/model/mime";
import { NoneEmptyString } from "../../data/non-empty-string";
import { UserId } from "../user/model/user-user-id";
import { Post, PostRelations, ShowPost, ShowPosts } from "./model/post.model";
import { PaginatedResult, PaginationDto } from "../../data/pagination";
import { FollowService } from "../user/follow/follow.service";
import { BLOCKED, FOLLOWING } from "../user/follow/model/follow.model";
import { MentionService } from "./mention/mention.service";
import { MediaId } from "../media/model/media-id";
import { CreateActionDto } from "../action/dto/create-action.dto";
import { ActionNotificationService } from "../common/service/action-notification.service";

export class PostService {
  constructor(
    private postRepo: IPostRepository,
    private mediaService: MediaService,
    private followService: FollowService,
    private mentionService: MentionService
  ) {}

  async getPosts(
    username: Username,
    viewer: User,
    paginationDto: PaginationDto,
    userService: UserService
  ): Promise<PaginatedResult<ShowPosts>> {
    const author = await userService.getUserBy(username);
    if (!author) throw new NotFound("User not found");
    if (author.id !== viewer.id) {
      const followingStatus = await this.followService.getFollowingStatus(
        author.id,
        viewer.id
      );
      const viewerStatus = await this.followService.getFollowingStatus(
        viewer.id,
        author.id
      );
      if (
        (author.isPrivate && followingStatus.status !== FOLLOWING) ||
        followingStatus.status === BLOCKED ||
        viewerStatus.status === BLOCKED
      ) {
        throw new Forbidden("You cannot access this data.");
      }
      return await this.postRepo.authorPosts(
        author.id,
        followingStatus.isCloseFriend,
        paginationDto
      );
    }
    return await this.postRepo.authorPosts(author.id, true, paginationDto);
  }

  async create(
    author: User,
    files: any,
    dto: CreatePostDto,
    tagService: TagService,
    actionNotificationService: ActionNotificationService
  ): Promise<void> {
    if (!Array.isArray(files) || (Array.isArray(files) && !files.length))
      throw new HttpError(400, "Post must include at least one picture");

    let mentionedUsers: User[] = [];
    if (dto.mentions) {
      mentionedUsers = await this.mentionService.validateMentions(
        dto.mentions,
        author
      );
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
    if (dto.caption) {
      const extractedTags = extractTag(dto.caption);
      if (extractedTags.length) {
        tags = await tagService.insert(extractedTags);
      }
    }

    const post = await this.postRepo.create({
      author,
      caption: dto.caption,
      media,
      tags,
      closeFriendsOnly: dto.closeFriendsOnly,
    });

    if (mentionedUsers.length) {
      const mentions = await this.mentionService.insert(
        post.id,
        mentionedUsers
      );

      for (const mention of mentions) {
        let mediaId: MediaId | null = null;
        if (media.length > 0) {
          mediaId = media[0].id;
        }

        const actionDto: CreateActionDto = {
          actorId: post.authorId,
          type: "mention",
          entityId: mention.id,
          actionDate: post.createdAt,
          mediaId: mediaId,
        };

        await actionNotificationService.createActionWithNotifications(
          actionDto,
          mention.userId,
          post.closeFriendsOnly
        );
      }
    }
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
      "likes",
      "comments",
    ]);
    if (!post) throw new NotFound("Post not found");
    if (post.authorId !== viewer.id) {
      const followingStatus = await this.followService.getFollowingStatus(
        post.authorId,
        viewer.id
      );
      const viewerStatus = await this.followService.getFollowingStatus(
        viewer.id,
        post.author.id
      );
      if (
        (post.author.isPrivate && followingStatus.status !== FOLLOWING) ||
        followingStatus.status === BLOCKED ||
        (post.closeFriendsOnly && !followingStatus.isCloseFriend) ||
        viewerStatus.status === BLOCKED
      ) {
        throw new Forbidden("You cannot access this data.");
      }
    }
    const avatar = (await userService.getUserBy(post.authorId, ["avatar"]))
      ?.avatar;

    return {
      id: post.id,
      caption: post.caption,
      author: {
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        username: post.author.username,
        avatar,
      },
      tags: post.tags.map((tag) => tag.title),
      mentions: post.mentions.map((mention) => mention.username),
      media: post.media,
      isBookmarked: post.bookmarks.some((bk) => bk.userId === viewer.id),
      bookmarksCount: post.bookmarks.length,
      likesCount: post.likes.length,
      isLiked: post.likes.some((like) => like.userId === viewer.id),
      commentsCount: post.comments.length,
      closeFriendsOnly: post.closeFriendsOnly,
      createdAt: post.createdAt,
    };
  }

  async update(
    postId: PostId,
    authenticatedId: UserId,
    dto: UpdatePostDto,
    tagService: TagService,
    actionNotificationService: ActionNotificationService,
    files?: Express.Multer.File[]
  ): Promise<void> {
    const post = await this.postRepo.findById(postId, [
      "author",
      "tags",
      "mentions",
      "media",
    ]);

    if (!post) throw new NotFound("Post not found");

    if (post.author.id !== authenticatedId)
      throw new Forbidden("Access Forbidden");

    let mentionedUsers: User[] = [];
    if (!dto.mentions) {
      for (const deletedMention of post.mentions) {
        actionNotificationService.deleteActionOfMention({
          actorId: post.authorId,
          entityId: deletedMention.id,
        });
      }

      await this.mentionService.deleteMentions(post.mentions);
    } else {
      mentionedUsers = await this.mentionService.validateMentions(
        dto.mentions,
        post.author
      );
      const deletedMentions = post.mentions.filter(
        (mention) => !mentionedUsers.find((user) => mention.userId === user.id)
      );

      for (const deletedMention of deletedMentions) {
        actionNotificationService.deleteActionOfMention({
          actorId: post.authorId,
          entityId: deletedMention.id,
        });
      }

      if (deletedMentions.length)
        await this.mentionService.deleteMentions(deletedMentions);
    }

    const deletedMedia = dto.deletedMedia;
    if (deletedMedia && deletedMedia.length) {
      if (
        deletedMedia.find(
          (deletedId) => !post.media.some((media) => media.id === deletedId)
        )
      )
        throw new BadRequest("Wrong media ids to delete.");

      const remainingMedia = post.media.filter(
        (media) => !deletedMedia.includes(media.id)
      );
      if (!remainingMedia.length && (!files || (files && !files.length)))
        throw new BadRequest("You cannot delete all of the post's media.");

      await this.mediaService.delete(deletedMedia);
      post.media = remainingMedia;
    }

    post.caption = dto.caption;
    post.tags = [];
    if (dto.caption) {
      const extractedTags = extractTag(dto.caption);
      if (extractedTags.length) {
        post.tags = await tagService.insert(extractedTags);
      }
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

    if (mentionedUsers.length) {
      const newMentions = await this.mentionService.insert(
        post.id,
        mentionedUsers.filter(
          (user) => !post.mentions.find((mention) => mention.userId === user.id)
        )
      );

      const unDeletedMentions = post.mentions.filter((mention) =>
        mentionedUsers.find((user) => mention.userId === user.id)
      );

      for (const unDeletedMention of unDeletedMentions) {
        let mediaId: MediaId | null = null;
        if (post.media.length > 0) {
          mediaId = post.media[0].id;
        }
        await actionNotificationService.updateActionOfMention({
          actorId: post.authorId,
          entityId: unDeletedMention.id,
          actionDate: new Date(),
          mediaId,
        });
      }

      for (const newMention of newMentions) {
        let mediaId: MediaId | null = null;
        if (post.media.length > 0) {
          mediaId = post.media[0].id;
        }

        const actionDto: CreateActionDto = {
          actorId: post.authorId,
          type: "mention",
          entityId: newMention.id,
          actionDate: new Date(),
          mediaId: mediaId,
        };

        await actionNotificationService.createActionWithNotifications(
          actionDto,
          newMention.userId,
          post.closeFriendsOnly
        );
      }
    }

    post.closeFriendsOnly = dto.closeFriendsOnly;

    await this.postRepo.update({
      id: post.id,
      caption: post.caption,
      tags: post.tags,
      media: post.media,
      closeFriendsOnly: post.closeFriendsOnly,
    });
  }

  async getPostsCount(author: User): Promise<number> {
    return await this.postRepo.postsCount(author);
  }

  async findPostById<R extends Array<keyof PostRelations>>(
    id: PostId,
    relations?: R
  ): Promise<Post | null> {
    if (relations !== undefined) {
      return await this.postRepo.findById(id, relations);
    }

    return await this.postRepo.findById(id);
  }
}
