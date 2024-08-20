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
  incrementFollowingCount(followerId: UserId): any;
  create(user: CreateUser): Promise<User>;
  update(id: UserId, fields: UpdateUser): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  whereUsernameIn(usernames: Username[]): Promise<User[]>;
  incrementFollowingCount(userId: UserId): Promise<void>;
  incrementFollowersCount(userId: UserId): Promise<void>;
  save(user: UserEntity): Promise<UserEntity>;
}

export interface IFollowRepository {
  findFollowers(user: UserEntity): Promise<FollowEntity[]>;
  findFollowing(user: UserEntity): Promise<FollowEntity[]>;
  countFollowing(user: UserEntity): Promise<number>;
  countFollowers(user: UserEntity): Promise<number>;
  delete(id: string): Promise<void>;
  create(follow: Partial<FollowEntity>): Promise<FollowEntity>;
  findByFollowerAndFollowing(
    follower: UserEntity,
    following: UserEntity
  ): Promise<FollowEntity | null>;
}

export interface IFollowRepository {
  findFollowers(user: UserEntity): Promise<FollowEntity[]>;
  findFollowing(user: UserEntity): Promise<FollowEntity[]>;
  countFollowing(user: UserEntity): Promise<number>;
  countFollowers(user: UserEntity): Promise<number>;
  delete(id: string): Promise<void>;
  create(follow: Partial<FollowEntity>): Promise<FollowEntity>;
  findByFollowerAndFollowing(
    follower: UserEntity,
    following: UserEntity
  ): Promise<FollowEntity | null>;
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
  async save(user: UserEntity): Promise<UserEntity> {
    return await this.repo.save(user);
  }

  async findById(id: UserId): Promise<User | null> {
    return await this.repo.findOne({
      where: { id },
      relations: { avatar: true },
    });
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

  async incrementFollowingCount(followerId: UserId): Promise<void> {
    const user = await this.repo.findOneBy({ id: followerId });
    if (user) {
      user.followingCount += 1;
      await this.repo.save(user);
    }
  }

  async incrementFollowersCount(userId: UserId): Promise<void> {
    const user = await this.repo.findOneBy({ id: userId });
    if (user) {
      user.followersCount += 1;
      await this.repo.save(user);
    }
  }
}

export class FollowRepository implements IFollowRepository {
  private flwrepo: Repository<FollowEntity>;
  private userRepository: UserRepository;

  constructor(dataSource: DataSource) {
    this.flwrepo = dataSource.getRepository(FollowEntity);
    this.userRepository = new UserRepository(dataSource);
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

  async countFollowers(user: UserEntity): Promise<number> {
    return this.flwrepo.count({
      where: { follower: user },
    });
  }

  async countFollowing(user: UserEntity): Promise<number> {
    return this.flwrepo.count({
      where: { following: user },
    });
  }

  async findByFollowerAndFollowing(
    follower: UserEntity,
    following: UserEntity
  ): Promise<FollowEntity | null> {
    return this.flwrepo.findOne({
      where: { follower, following },
    });
  }

  async incrementFollowingCount(userId: UserId): Promise<void> {
    await this.userRepository.incrementFollowingCount(userId);
  }

  async incrementFollowersCount(userId: UserId): Promise<void> {
    await this.userRepository.incrementFollowersCount(userId);
  }

  async create(follow: Partial<FollowEntity>): Promise<FollowEntity> {
    const newFollow = this.flwrepo.create(follow);
    return this.flwrepo.save(newFollow);
  }

  async delete(id: string): Promise<void> {
    await this.flwrepo.delete(id);
  }
}
