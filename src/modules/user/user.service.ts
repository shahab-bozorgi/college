import { compare, hash } from "bcrypt";
import { BadRequest, UnAuthorized } from "../../utilities/httpError";
import { SignUpDto } from "./dto/create-user.dto";
import { User } from "./model/user.model";
import { IUserRepository } from "./user.repository";
import { LoginUserDto } from "./dto/login-user.dto";
import { EditProfileDto } from "./dto/edit-peofile-user.dto";
import jwt from "jsonwebtoken";
import { Username } from "./model/user-username";
import { isUserId, UserId } from "./model/user-user-id";

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

  async findByUsername(username: Username): Promise<User | null> {
    return await this.repo.findByUsername(username);
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

  async editProfile(username: Username, dto: EditProfileDto) {
    const user = await this.repo.findByUsername(username);
    if (!user) {
      throw new BadRequest("کاربر وجود ندارد!");
    }

    if (dto.avatar_url !== undefined) user.avatar_url = dto.avatar_url;
    if (dto.first_name !== undefined) user.first_name = dto.first_name;
    if (dto.last_name !== undefined) user.last_name = dto.last_name;
    if (dto.bio !== undefined) user.bio = dto.bio;

    if (dto.email && dto.email !== user.email) {
      if (await this.repo.findByEmail(dto.email)) {
        throw new BadRequest("این ایمیل از قبل وجود دارد!");
      }
    }

    if (dto.password && !(await compare(dto.password, user.password))) {
      user.password = await hash(dto.password, 12);
    }

    // * Check in the next tasks *
    if (dto.is_private == true){

    }

    const result = await this.repo.update(user.id, user);

    return user;
  }
}
