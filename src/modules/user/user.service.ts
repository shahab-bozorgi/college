import { compare, hash } from "bcrypt";
import {
  BadRequest,
  Forbidden,
  HttpError,
  NotFound,
  UnAuthorized,
} from "../../utilities/http-error";
import { SignUpDto } from "./dto/create-user.dto";
import { UpdateUser, User, UserProfile } from "./model/user.model";
import { IFollowRepository, IUserRepository } from "./user.repository";
import { LoginUserDto } from "./dto/login-user.dto";
import { EditProfileDto } from "./dto/edit-profile.dto";
import jwt from "jsonwebtoken";
import { isUsername, Username } from "./model/user-username";
import { UserId } from "./model/user-user-id";
import { Email, isEmail } from "../../data/email";
import { PasswordResetService } from "../password-reset/password-reset.service";
import { PasswordResetDto } from "../password-reset/dto/password-reset.dto";
import { Media } from "../media/media.model";
import { UserEntity } from "./entity/user.entity";
import { PostService } from "../post/post.service";
import { UserListsDtoType } from "./dto/follow-user.dto";

export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private flwRepo: IFollowRepository
  ) {}

  async create(dto: SignUpDto): Promise<User> {
    if (await this.userRepo.findByUsername(dto.username)) {
      throw new BadRequest("نام کاربری از قبل وجود داره!");
    }

    if (await this.userRepo.findByEmail(dto.email)) {
      throw new BadRequest("آدرس ایمیل از قبل وجود داره!");
    }

    return await this.userRepo.create({
      username: dto.username,
      password: await hash(dto.password, 12),
      email: dto.email,
    });
  }

  async findByUsername(username: Username): Promise<User | null> {
    return await this.userRepo.findByUsername(username);
  }

  async login({ username, password }: LoginUserDto) {
    let user;
    if (isEmail(username)) {
      user = await this.userRepo.findByEmail(username);
    } else {
      user = await this.userRepo.findByUsername(username);
    }

    if (!user || (user && !(await compare(password, user.password))))
      throw new UnAuthorized("نام کاربری یا رمز عبور اشتباهه!");

    const secretKey = process.env.SECRET_KEY ?? "super-secret";

    const token = jwt.sign({ username: user.username }, secretKey, {
      expiresIn: "1h",
    });

    return { token: token };
  }

  async editProfile(user: User, dto: EditProfileDto): Promise<User | null> {
    if (
      dto.email &&
      dto.email !== user.email &&
      (await this.userRepo.findByEmail(dto.email))
    ) {
      throw new BadRequest("این ایمیل از قبل وجود دارد!");
    }

    const fields: UpdateUser = {
      first_name: dto.first_name,
      last_name: dto.last_name,
      bio: dto.bio,
      email: dto.email,
      is_private: dto.is_private,
    };

    if (dto.password) {
      fields.password = await hash(dto.password, 12);
    }

    return await this.userRepo.update(user.id, fields);
  }

  async updateAvatar(user: User, avatar: Media): Promise<void> {
    await this.userRepo.update(user.id, { avatar });
  }

  async followUser(followerId: UserId, followingId: UserId): Promise<void> {
    if (followerId == followingId) {
      throw new BadRequest("خودتو فالو نکن!");
    }

    const follower = (await this.userRepo.findById(followerId)) as UserEntity;
    const following = (await this.userRepo.findById(followingId)) as UserEntity;
    if (!follower || !following) {
      throw new BadRequest("کاربر یافت نشد!");
    }
    const followEntity = await this.flwRepo.findByFollowerAndFollowing(
      follower,
      following
    );
    if (followEntity) {
      throw new BadRequest("شما قبلاً این کاربر را فالو کرده‌اید!");
    }

    await this.flwRepo.create({
      follower,
      following,
    });
  }

  async getFollowers(userId: UserId): Promise<UserListsDtoType[]> {
    const followersEntities = await this.flwRepo.findFollowersByUser(userId);
    const followersUsers = await Promise.all(
      followersEntities.map(async (followerEntity) => {
        const followersCount = await this.flwRepo.countFollowers(
          followerEntity
        );

        return {
          id: followerEntity.id,
          avatar: followerEntity.avatar ? followerEntity.avatar.path : null,
          username: followerEntity.username,
          first_name: followerEntity.first_name,
          last_name: followerEntity.last_name,
          bio: followerEntity.bio,
          followersCount: followersCount,
        };
      })
    );

    return followersUsers;
  }

  async getFollowing(userId: UserId): Promise<UserListsDtoType[]> {
    const followingEntities = await this.flwRepo.findFollowingByUser(userId);

    const followingUsers = await Promise.all(
      followingEntities.map(async (followingEntity) => {
        const followersCount = await this.flwRepo.countFollowers(
          followingEntity
        );

        return {
          id: followingEntity.id,
          avatar: followingEntity.avatar ? followingEntity.avatar.path : null,
          username: followingEntity.username,
          first_name: followingEntity.first_name,
          last_name: followingEntity.last_name,
          bio: followingEntity.bio,
          followersCount: followersCount,
        };
      })
    );

    return followingUsers;
  }

  async unfollowUser(followerId: UserId, followingId: UserId): Promise<void> {
    const follower = (await this.userRepo.findById(followerId)) as UserEntity;
    const following = (await this.userRepo.findById(followingId)) as UserEntity;

    if (!follower || !following) {
      throw new BadRequest("کاربر یافت نشد!");
    }

    const followEntity = await this.flwRepo.findByFollowerAndFollowing(
      follower,
      following
    );
    if (!followEntity) {
      throw new BadRequest("شما این کاربر را فالو نکرده‌اید!");
    }

    await this.flwRepo.delete(followEntity.id);
  }

  async userProfile(
    username: Username,
    authenticatedUser: User,
    postService: PostService
  ): Promise<Partial<UserProfile> | undefined> {
    const user = await this.userRepo.findByUsername(username, ["avatar"]);
    if (!user) {
      throw new NotFound("User not found");
    }

    const userProfile: UserProfile = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      bio: user.bio,
      followingCount: await this.flwRepo.countFollowing(user),
      followersCount: await this.flwRepo.countFollowers(user),
      postsCount: await postService.getPostsCount(user),
    };

    if (user.id !== authenticatedUser.id) {
      const followingStatus = await this.flwRepo.findByFollowerAndFollowing(
        authenticatedUser as UserEntity,
        user as UserEntity
      );
      userProfile.followingStatus = Boolean(followingStatus);
    }
    return userProfile;
  }

  async getUserBy(
    field: Email | Username | UserId,
    relations?: string[]
  ): Promise<User | null> {
    let user;
    if (isEmail(field)) {
      user = await this.userRepo.findByEmail(field, relations);
    } else if (isUsername(field)) {
      user = await this.userRepo.findByUsername(field, relations);
    } else {
      user = await this.userRepo.findById(field, relations);
    }

    return user;
  }

  async passwordReset(
    dto: PasswordResetDto,
    passwordResetService: PasswordResetService
  ): Promise<void | never> {
    const passwordReset = await passwordResetService.findToken(dto.token);

    if (!passwordReset) throw new Forbidden("Access forbidden");

    await passwordResetService.deleteToken(dto.token);
    if (passwordReset.expireAt < new Date())
      throw new BadRequest("Token expired");

    if (
      !(await this.userRepo.update(passwordReset.user.id, {
        password: await hash(dto.password, 12),
      }))
    )
      throw new HttpError(500, "Something went wrong");
  }

  async whereUsernameIn(usernames: Username[]): Promise<User[]> {
    return this.userRepo.whereUsernameIn(usernames);
  }
}
