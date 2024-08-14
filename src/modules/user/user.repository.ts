import { DataSource, In, Repository } from "typeorm";
import { UpdateUser, User } from "../user/model/user.model";
import { CreateUser } from "../user/model/user.model";
import { UserEntity } from "./entity/user.entity";
import { Username } from "./model/user-username";
import { Email } from "../../data/email";
import { UserId } from "./model/user-user-id";
import { v4 } from "uuid";
import { FollowEntity } from "./entity/follow.entity";

export interface IUserRepository {
  create(user: CreateUser): Promise<User>;
  update(id: UserId, fields: UpdateUser): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  whereUsernameIn(usernames: Username[]): Promise<User[]>;
}

export interface IFollowRepository {
  findFollowers(user: UserEntity): Promise<FollowEntity[]>;
  findFollowing(user: UserEntity): Promise<FollowEntity[]>;
}

export class UserRepository implements IUserRepository {
  private repo: Repository<UserEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(UserEntity);
  }

  async create(user: CreateUser): Promise<User> {
    return await this.repo.save({ ...user, id: v4() });
  }

  async update(id: UserId, fields: UpdateUser): Promise<User | null> {
    return await this.repo.save({ ...fields, id });
  }

  async findById(id: UserId): Promise<User | null> {
    return await this.repo.findOneBy({ id });
  }

  async findByUsername(username: Username): Promise<User | null> {
    return await this.repo.findOne({ where: { username } });
  }

  async findByEmail(email: Email): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }

  async whereUsernameIn(usernames: Username[]): Promise<User[]> {
    return await this.repo.findBy({ username: In(usernames) });
  }
}

export class FollowRepository implements IFollowRepository {
  private flwrepo: Repository<FollowEntity>;

  constructor(dataSource: DataSource) {
    this.flwrepo = dataSource.getRepository(FollowEntity);
  }

  async findFollowers(user: UserEntity): Promise<FollowEntity[]> {
    return this.flwrepo.find({
      where: { following: user },
      relations: ["follower"],
    });
  }

  async findFollowing(user: UserEntity): Promise<FollowEntity[]> {
    return this.flwrepo.find({
      where: { follower: user },
      relations: ["following"],
    });
  }
}