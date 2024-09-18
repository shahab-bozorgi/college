import { z } from "zod";
import {
  NoneEmptyString,
  zodNoneEmptyString,
} from "../../../data/non-empty-string";
import {
  PaginatedResult,
  PaginationDto,
  paginationSchema,
} from "../../../data/pagination";
import { User } from "../../user/model/user.model";
import { FollowingStatus } from "../../user/follow/model/follow.model";
import { UserId } from "../../user/model/user-user-id";
import { Username } from "../../user/model/user-username";
import { Media } from "../../media/model/media.model";
import { PostId } from "../../post/model/post-id";
import { TagTitle } from "../../tag/field-types/tag-title";
import { ISearchRepository } from "../repository/search.repository";
import { PositiveInt, zodPositiveInt } from "../../../data/int";

export const searchSchema = z
  .object({
    query: zodNoneEmptyString,
  })
  .merge(paginationSchema);

export const searchSuggestionSchema = z.object({
  query: zodNoneEmptyString,
  count: zodPositiveInt.default(3),
});

export type SearchSuggestionUser = {
  firstName: string;
  lastName: string;
  username: Username;
  avatar: Media;
  isCloseFriend: boolean;
};
export type SearchUser = {
  id: UserId;
  firstName: string;
  lastName: string;
  username: Username;
  avatar: Media;
  followersCount: number;
  followingStatus: FollowingStatus["status"];
  isCloseFriend: boolean;
};
export type SearchSuggestionTag = TagTitle;
export type SearchTagPost = {
  id: PostId;
  media: Media[];
  closeFriendsOnly: boolean;
};
export class SearchService {
  constructor(private searchRepo: ISearchRepository) {}

  async suggestUsers(
    authenticatedUser: User,
    searchQuery: NoneEmptyString,
    count: PositiveInt
  ): Promise<SearchSuggestionUser[]> {
    return await this.searchRepo.suggestUsers(
      authenticatedUser,
      searchQuery,
      count
    );
  }

  async searchUsers(
    authenticatedUser: User,
    searchQuery: NoneEmptyString,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ users: SearchUser[] }>> {
    return await this.searchRepo.findUsers(
      authenticatedUser,
      searchQuery,
      pagination
    );
  }

  async suggestTags(
    searchQuery: NoneEmptyString,
    count: PositiveInt
  ): Promise<SearchSuggestionTag[]> {
    return await this.searchRepo.suggestTags(searchQuery, count);
  }

  async searchTagPosts(
    authenticatedUser: User,
    searchQuery: NoneEmptyString,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ posts: SearchTagPost[] }>> {
    return await this.searchRepo.findTagPosts(
      authenticatedUser,
      searchQuery,
      pagination
    );
  }
}
