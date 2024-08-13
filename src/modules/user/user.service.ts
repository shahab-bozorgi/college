import { compare, hash } from "bcrypt";
import {
  BadRequest,
  HttpError,
  UnAuthorized,
} from "../../utilities/http-error";
import { SignUpDto } from "./dto/create-user.dto";
import { UpdateUser, User, UserProfile } from "./model/user.model";
import { IUserRepository } from "./user.repository";
import { LoginUserDto } from "./dto/login-user.dto";
import { EditProfileDto } from "./dto/edit-peofile.dto";
import jwt from "jsonwebtoken";
import { Username } from "./model/user-username";
import { UserId } from "./model/user-user-id";
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
