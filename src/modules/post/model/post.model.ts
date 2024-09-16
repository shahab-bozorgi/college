import { Tag } from "../../tag/tag.model";
import { UserId } from "../../user/model/user-user-id";
import { User } from "../../user/model/user.model";
import { PostId } from "./post-id";
import { TagTitle } from "../../tag/field-types/tag-title";
import { Username } from "../../user/model/user-username";
import { Bookmark } from "../bookmark/model/bookmark.model";
import { LikePost } from "../like-post/model/like-post-model";
import { Comment } from "../comment/model/comment.model";
import { Mention } from "../mention/model/mention.model";
import { Media } from "../../media/model/media.model";

export interface Post {
  id: PostId;
  caption: string;
  authorId: UserId;
  createdAt: Date;
  closeFriendsOnly: boolean;
  media: Media[];
}

export interface PostRelations {
  author: User;
  mentions: Mention[];
  tags: Tag[];
  media: Media[];
  bookmarks: Bookmark[];
  likes: LikePost[];
  comments: Comment[];
}

export type PostSelectedRelations<R extends Array<keyof PostRelations>> = {
  [K in R[number]]: PostRelations[K];
};

export interface CreatePost
  extends Partial<PostSelectedRelations<["tags", "media", "author"]>> {
  caption: string;
  closeFriendsOnly: boolean;
}

export interface UpdatePost
  extends Partial<PostSelectedRelations<["tags", "media"]>> {
  id: PostId;
  caption: string;
  closeFriendsOnly: boolean;
}

export interface ShowPost {
  id: PostId;
  caption: string;
  author: {
    firstName?: string;
    lastName?: string;
    username: Username;
    avatar?: Media;
  };
  mentions: Username[];
  tags: TagTitle[];
  media: Media[];
  isBookmarked: boolean;
  bookmarksCount: number;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  closeFriendsOnly: boolean;
  createdAt: Date;
}

export interface ShowPosts {
  posts: Array<{
    id: PostId;
    createdAt: Date;
    media: Media[];
    closeFriendsOnly: boolean;
  }>;
}
