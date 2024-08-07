import { HttpError } from "../../utilities/http-error";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserRepository } from "./user.repository";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async login({ username, password }: LoginUserDto) {
    const user = await this.userRepo.findByUsername(username);

    if (!user || (user && (await bcrypt.compare(password, user.password))))
      throw new HttpError(401, "username or password is invalid");

    const secretKey =
      typeof process.env.SECRET_KEY === "string"
        ? process.env.SECRET_KEY
            : "secret-key";
      
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    return token;
  }
}
