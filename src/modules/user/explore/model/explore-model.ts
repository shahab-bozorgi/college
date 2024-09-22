import { Media } from "../../../media/model/media.model";
import { PostId } from "../../../post/model/post-id";
import { UserId } from "../../../user/model/user-user-id";
import { Username } from "../../../user/model/user-username";

export interface Explore {
  id: PostId;
  author: {
    id: UserId;
    firstName: string;
    lastName: string;
    username: Username;
    avatar: Media;
    followersCount: number;
    isCloseFriend: boolean;
  };
  media: string[];
  isLiked: boolean;
  likesCount: number;
  isBookmarked: boolean;
  bookmarksCount: number;
  commentsCount: number;
  closeFriendsOnly: boolean;
}
