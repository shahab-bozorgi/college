import { v4 } from "uuid";
import {
  CreateUser,
  UpdateUser,
  User,
} from "../../../../modules/user/model/user.model";
import { IUserRepository } from "../../../../modules/user/user.repository";
import { UserId } from "../../../../modules/user/model/user-user-id";
import { Username } from "../../../../modules/user/model/user-username";
import { Email } from "../../../../data/email";
import { UserEntity } from "../../../../modules/user/entity/user.entity";
import { FollowEntity } from "../../../../modules/user/follow/entity/follow.entity";
import { IFollowRepository } from "../../../../modules/user/follow/follow.repository";

export class MockUserRepository implements IUserRepository {
  save(user: UserEntity): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }
  private users: User[] = [];

  async create(user: CreateUser): Promise<User> {
    const newUser = { ...user, id: v4() as UserId };
    this.users.push(newUser);
    return newUser;
  }

  update(id: UserId, fields: UpdateUser): Promise<User | null> {
    throw new Error("Method not implemented.");
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByUsername(username: Username): Promise<User | null> {
    return this.users.find((user) => user.username === username) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  whereUsernameIn(usernames: Username[]): Promise<User[]> {
    throw new Error("Method not implemented.");
  }
}

export class MockFollowRepository implements IFollowRepository {
  findFollowing(user: UserEntity): Promise<FollowEntity[]> {
    throw new Error("Method not implemented.");
  }
  findFollowingByUser(userId: UserId): Promise<UserEntity[]> {
    throw new Error("Method not implemented.");
  }
  findFollowers(user: UserEntity): Promise<FollowEntity[]> {
    throw new Error("Method not implemented.");
  }
  findFollowersByUser(userId: UserId): Promise<UserEntity[]> {
    throw new Error("Method not implemented.");
  }
  countFollowing(user: User): Promise<number> {
    throw new Error("Method not implemented.");
  }
  countFollowers(user: User): Promise<number> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  create(follow: Partial<FollowEntity>): Promise<FollowEntity> {
    throw new Error("Method not implemented.");
  }
  findByFollowerAndFollowing(
    follower: UserEntity,
    following: UserEntity
  ): Promise<FollowEntity | null> {
    throw new Error("Method not implemented.");
  }
}
