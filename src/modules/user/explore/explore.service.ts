import { IExploreRepository } from "./explore-repository";
import { ExploreDto } from "./dto/explore-dto";
import { User } from "../model/user.model";

export class ExploreService {
  constructor(private exploreRepo: IExploreRepository) {}

  async explore(authenticatedUser: User, dto: ExploreDto) {
    return await this.exploreRepo.findPostsByUserIds(authenticatedUser, {
      page: dto.page,
      limit: dto.limit,
    });
  }
}
