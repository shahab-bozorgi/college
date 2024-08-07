import { DataSource, Equal, Repository } from "typeorm";
import { User } from "../user/model/user.model";
import { CreateUser } from "../user/model/user.model";
import { UserEntity } from "./entity/user.entity";
import { Username } from "./model/user-username";
import { Email } from "../../data/email";

export interface IUserRepository {
  create(user: CreateUser): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  private repo: Repository<UserEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(UserEntity);
  }

  async create(user: CreateUser): Promise<User | null> {
    return await this.repo.save(user);
  }

  async findByUsername(username: Username): Promise<User | null> {
    return await this.repo.findOne({where: { username: Equal(username) }});
    }

  async findByEmail(email: Email): Promise<User | null> {
    return await this.repo.findOne({ where: { email: Equal(email) } });
  }
}

