import { compare, hash } from "bcrypt";
import {
  BadRequest,
  HttpError,
  UnAuthorized,
} from "../../utilities/http-error";
import { SignUpDto } from "./dto/create-user.dto";
import { User, UserProfile } from "./model/user.model";
import { IUserRepository } from "./user.repository";
import { LoginUserDto } from "./dto/login-user.dto";
import { EditProfileDto } from "./dto/edit-profile-user.dto";
import jwt from "jsonwebtoken";
import { Username } from "./model/user-username";
import { isUserId, UserId } from "./model/user-user-id";
import { isEmail } from "../../data/email";

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

    const token = jwt.sign({ user_id: user.username }, secretKey, {
      expiresIn: "1h",
    });

    return { token: token };
  }

  async authenticateByUsername(username: Username): Promise<User | null> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new HttpError(401, "not authorized");

    return user;
  }

  async editProfile(username: Username, dto: EditProfileDto) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new BadRequest("کاربر وجود ندارد!");
    }

    if (dto.avatar_url !== undefined) user.avatar_url = dto.avatar_url;
    if (dto.first_name !== undefined) user.first_name = dto.first_name;
    if (dto.last_name !== undefined) user.last_name = dto.last_name;
    if (dto.bio !== undefined) user.bio = dto.bio;

    if (dto.email && dto.email !== user.email) {
      if (await this.userRepo.findByEmail(dto.email)) {
        throw new BadRequest("این ایمیل از قبل وجود دارد!");
      }
    }

    if (dto.password && !(await compare(dto.password, user.password))) {
      user.password = await hash(dto.password, 12);
    }

    // * Check in the next tasks *
    if (dto.is_private == true) {
    }

    const result = await this.userRepo.update(user.id, user);

    return user;
  }

  async userProfile(
    userId: UserId
  ): Promise<Partial<User> | Partial<UserProfile> | undefined> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      return undefined;
    }

    return {
      username: user.username,
      first_name: user.first_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
    };
  }
}
