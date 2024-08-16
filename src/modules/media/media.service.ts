import { CreateMedia, Media } from "./media.model";
import { IMediaRepository } from "./media.repository";

export class MediaService {
  constructor(private mediaRepo: IMediaRepository) {}

  async create(fields: CreateMedia): Promise<Media | null> {
    return await this.mediaRepo.create(fields);
  }
}
