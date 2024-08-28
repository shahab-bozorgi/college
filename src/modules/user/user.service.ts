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
import { IUserRepository } from "./user.repository";
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
import { FollowService } from "./follow/follow.service";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

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

  async userProfile(
    username: Username,
    authenticatedUser: User,
    postService: PostService,
    followService: FollowService
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
      email: user.email,
      followingCount: await followService.getcountFollowing(user.id),
      followersCount: await followService.getcountFollowers(user.id),
      postsCount: await postService.getPostsCount(user),
    };

    if (user.id !== authenticatedUser.id) {
      const followingStatus = await followService.getFollow(
        authenticatedUser.id,
        user.id
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
