import { compare, hash } from "bcrypt";
import {
  BadRequest,
  HttpError,
  UnAuthorized,
} from "../../utilities/http-error";
import { SignUpDto } from "./dto/create-user.dto";
import { User } from "./model/user.model";
import { IUserRepository } from "./user.repository";
import { LoginUserDto } from "./dto/login-user.dto";
import { EditProfileDto } from "./dto/edit-profile-user.dto";
import jwt from "jsonwebtoken";
import { Username } from "./model/user-username";
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
}
