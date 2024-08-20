import { DataSource, Repository } from "typeorm";
import { CreatePost, Post } from "./post.model";
import { PostEntity } from "./post.entity";
import { v4 } from "uuid";
import { User } from "../user/model/user.model";

export interface IPostRepository {
  create(fields: CreatePost): Promise<Post | null>;
  postsCount(author: User): Promise<number>;
}

export class PostRepository implements IPostRepository {
  private repo: Repository<PostEntity>;
  constructor(datasource: DataSource) {
    this.repo = datasource.getRepository(PostEntity);
  }

  async postsCount(author: User): Promise<number> {
    return await this.repo.countBy({ authorId: author.id });
  }

  async create(fields: CreatePost): Promise<Post | null> {
    return await this.repo.save({ ...fields, id: v4() });
  }
}
