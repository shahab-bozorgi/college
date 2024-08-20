import { DataSource, Repository } from "typeorm";
import { CreateMedia, Media } from "./media.model";
import { MediaEntity } from "./media.entity";
import { v4 } from "uuid";

export interface IMediaRepository {
  create(fields: CreateMedia): Promise<Media>;
}

export class MediaRepository implements IMediaRepository {
  private repo: Repository<MediaEntity>;

  constructor(datasource: DataSource) {
    this.repo = datasource.getRepository(MediaEntity);
  }

  async create(fields: CreateMedia): Promise<Media> {
    return this.repo.save({ ...fields, id: v4() });
  }
}
