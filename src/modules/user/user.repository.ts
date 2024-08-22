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
  save(user: UserEntity): Promise<UserEntity>;
}

export interface IFollowRepository {
  findFollowing(user: UserEntity): Promise<FollowEntity[]>;
  findFollowingByUser(userId: UserId): Promise<UserEntity[]>;
  findFollowers(user: UserEntity): Promise<FollowEntity[]>;
  countFollowing(user: User): Promise<number>;
  countFollowers(user: User): Promise<number>;
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

  async findById(id: UserId): Promise<UserEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: { avatar: true, followers: true, following: true },
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

  async countFollowers(user: User): Promise<number> {
    return this.flwrepo.countBy({ followingId: user.id });
  }

  async countFollowing(user: User): Promise<number> {
    return this.flwrepo.countBy({ followerId: user.id });
  }

  async findByFollowerAndFollowing(
    follower: UserEntity,
    following: UserEntity
  ): Promise<FollowEntity | null> {
    return this.flwrepo.findOne({
      where: {
        followerId: follower.id,
        followingId: following.id,
      },
    });
  }
  async findFollowingByUser(userId: UserId): Promise<UserEntity[]> {
    const following = await this.flwrepo.find({
      where: { follower: { id: userId } },
      relations: ["following"],
    });
    return following.map((follow) => follow.following);
  }

  async create(follow: Partial<FollowEntity>): Promise<FollowEntity> {
    const newFollow = this.flwrepo.create(follow);
    return this.flwrepo.save(newFollow);
  }

  async delete(id: UserId): Promise<void> {
    await this.flwrepo.delete(id);
  }
}
