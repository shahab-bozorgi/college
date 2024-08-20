import { HttpError } from "../../utilities/http-error";
import { CreateMedia, Media } from "./media.model";
import { IMediaRepository } from "./media.repository";

export class MediaService {
  constructor(private mediaRepo: IMediaRepository) {}

  async create(fields: CreateMedia): Promise<Media> {
    const media = await this.mediaRepo.create(fields);
    if (media) return media;
    throw new HttpError(500, "Internal server error!");
  }

  async insert(fields: CreateMedia[]): Promise<Media[]> {
    const media = await this.mediaRepo.insert(fields);
    if (media.length) return media;
    throw new HttpError(500, "Internal server error!");
  }
}
