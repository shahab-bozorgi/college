import { v4 } from "uuid";
import { hash } from "bcrypt";
import { AppDataSource } from "../data-source";
import { UserEntity } from "../modules/user/entity/user.entity";
import { UserId } from "../modules/user/model/user-user-id";
import { Username } from "../modules/user/model/user-username";
import { Password } from "../modules/user/model/user-password";
import { CreateUser } from "../modules/user/model/user.model";
import { Email } from "../data/email";

export const seedUser = async () => {
  const userRepo = AppDataSource.getRepository(UserEntity);

  const count = await userRepo.count();

  if (count === 0) {
    await userRepo.save({
      id: v4() as UserId,
      username: "ali" as Username,
      password: await hash("Ali@1234", 12),
      email: "alialavi@gmail.com",
    });
  }
};
