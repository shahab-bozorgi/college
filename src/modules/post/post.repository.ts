import { DataSource, Repository } from "typeorm";
import { CreatePost, Post } from "./post.model";
import { PostEntity } from "./post.entity";
import { v4 } from "uuid";

export interface IPostRepository {
  create(fields: CreatePost): Promise<Post | null>;
}

export class PostRepository implements IPostRepository {
  private repo: Repository<PostEntity>;
  constructor(datasource: DataSource) {
    this.repo = datasource.getRepository(PostEntity);
  }

  async create(fields: CreatePost): Promise<Post | null> {
    return await this.repo.save({ ...fields, id: v4() });
  }
}
