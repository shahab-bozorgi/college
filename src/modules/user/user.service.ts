import { compare, hash } from "bcrypt";
import {
  BadRequest,
  Forbidden,
  HttpError,
  UnAuthorized,
} from "../../utilities/http-error";
import { SignUpDto } from "./dto/create-user.dto";
import { UpdateUser, User, UserProfile } from "./model/user.model";
import { IFollowRepository, IUserRepository } from "./user.repository";
import { LoginUserDto } from "./dto/login-user.dto";
import { EditProfileDto } from "./dto/edit-profile.dto";
import jwt from "jsonwebtoken";
import { Username } from "./model/user-username";
import { UserId } from "./model/user-user-id";
import { Email, isEmail } from "../../data/email";
import { PasswordResetService } from "../password-reset/password-reset.service";
import { PasswordResetDto } from "../password-reset/dto/password-reset.dto";
import { Media } from "../media/media.model";
import { FollowEntity } from "./entity/follow.entity";
import { UserEntity } from "./entity/user.entity";

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

  async followUser(
    followerId: UserId,
    followingId: UserId
  ): Promise<FollowEntity> {
    const follower = await this.userRepo.findById(followerId) as UserEntity;
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

    return await this.flwRepo.create({
      follower,
      following,
    });
  }

  async unfollowUser(followerId: UserId, followingId: UserId): Promise<void>{
    const follower = await this.userRepo.findById(followerId) as UserEntity;
    const following = await this.userRepo.findById(followingId) as UserEntity

    if (!follower || !following){
      throw new BadRequest("کاربر یافت نشد!");
    }

    const followEntity = await this.flwRepo.findByFollowerAndFollowing(
      follower,
      following
    );
    if (!followEntity) {
      throw new BadRequest("شما این کاربر را فالو نکرده‌اید!");
    }
  }
  
  async userProfile(userId: UserId): Promise<Partial<UserProfile> | undefined> {
    const user = await this.userRepo.findById(userId) as UserEntity;
    if (!user) {
      return undefined;
    }

    const followingCount = await this.flwRepo.countFollowing(user);
    const followersCount = await this.flwRepo.countFollowers(user);

    const { username, first_name, bio, avatar_url } = user;
    return {
      username: user.username,
      first_name: user.first_name,
      bio: user.bio,
      // avatar_url: user.avatar_url,
    };
  }

  async getUserBy(field: Email | Username): Promise<User | null> {
    let user;
    if (isEmail(field)) {
      user = await this.userRepo.findByEmail(field);
    } else {
      user = await this.userRepo.findByUsername(field);
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
