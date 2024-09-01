import { NoneEmptyString } from "../../../data/non-empty-string";
import { Media } from "../../media/media.model";
import { Tag } from "../../tag/tag.model";
import { UserId } from "../../user/model/user-user-id";
import { User } from "../../user/model/user.model";
import { PostId } from "./post-id";
import { TagTitle } from "../../tag/field-types/tag-title";
import { Username } from "../../user/model/user-username";
import { Bookmark } from "../bookmark/model/bookmark.model";

export interface Post {
  id: PostId;
  caption: NoneEmptyString;
  authorId: UserId;
  createdAt: Date;
}

export interface PostRelations {
  author: User;
  mentions: User[];
  tags: Tag[];
  media: Media[];
  bookmarks: Bookmark[];
}

export type PostSelectedRelations<R extends Array<keyof PostRelations>> = {
  [K in R[number]]: PostRelations[K];
};

export interface CreatePost
  extends Partial<PostSelectedRelations<["tags", "mentions"]>> {
  caption: NoneEmptyString;
  author: User;
  media: Media[];
}

export interface UpdatePost
  extends Partial<PostSelectedRelations<["tags", "mentions", "media"]>> {
  id: PostId;
  caption?: NoneEmptyString;
}

export interface ShowPost {
  id: PostId;
  caption: NoneEmptyString;
  author: {
    first_name?: string;
    last_name?: string;
    username: Username;
    avatar?: Media;
  };
  mentions: Username[];
  tags: TagTitle[];
  media: Media[];
  isBookmarked: boolean;
  bookmarksCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
}

export interface ShowPosts {
  posts: Array<{ id: PostId; createdAt: Date; media: Media[] }>;
}
