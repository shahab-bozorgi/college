import { NoneEmptyString } from "../../data/non-empty-string";
import { Media } from "../media/media.model";
import { User } from "../user/model/user.model";
import { PostId } from "./field-types/post-id";

export interface Post {
  id: PostId;
  caption: NoneEmptyString;
  author: User;
  media: Media[];
  mentions?: User[];
}

export interface CreatePost {
  caption: NoneEmptyString;
  author: User;
  media: Media[];
  mentions?: User[];
}
