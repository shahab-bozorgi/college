import { NoneEmptyString } from "../../data/non-empty-string";
import { Media } from "../media/media.model";
import { Tag } from "../tag/tag.model";
import { UserId } from "../user/model/user-user-id";
import { User } from "../user/model/user.model";
import { PostId } from "./field-types/post-id";

export interface Post {
  id: PostId;
  caption: NoneEmptyString;
  authorId: UserId;
}

export interface PostRelations {
  author: User;
  mentions: User[];
  tags: Tag[];
  media: Media[];
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
