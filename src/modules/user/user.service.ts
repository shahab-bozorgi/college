import { compare, hash } from "bcrypt";
import { BadRequest, UnAuthorized } from "../../utilities/httpError";
import { SignUpDto } from "./dto/create-user.dto";
import { User } from "./model/user.model";
import { IUserRepository } from "./user.repository";
import { LoginUserDto } from "./dto/login-user.dto";
import jwt from "jsonwebtoken";

export class UserService {
  constructor(private repo: IUserRepository) {}

  async create(dto: SignUpDto): Promise<User> {
    if (await this.repo.findByUsername(dto.username)) {
      throw new BadRequest("نام کاربری از قبل وجود داره!");
    }

    if (await this.repo.findByEmail(dto.email)) {
      throw new BadRequest("آدرس ایمیل از قبل وجود داره!");
    }

    return await this.repo.create({
      username: dto.username,
      password: await hash(dto.password, 12),
      email: dto.email,
    });
  }

  async login({ username, password }: LoginUserDto) {
    const user = await this.repo.findByUsername(username);

    if (!user || (user && !(await compare(password, user.password))))
      throw new UnAuthorized("نام کاربری یا رمز عبور اشتباهه!");

    const secretKey =
      typeof process.env.SECRET_KEY === "string"
        ? process.env.SECRET_KEY
        : "secret-key";

    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    return token;
  }
}
