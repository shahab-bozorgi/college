import { HttpError } from "../../utilities/http-error";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserRepository } from "./user.repository";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async login({ username, password }: LoginUserDto) {
    const user = await this.userRepo.findByUsername(username);

    if (!user || (user && user.password !== password))
      throw new HttpError(401, "username or password is invalid");

    return user;
  }
}
