import jwt from "jsonwebtoken";
import { seedUser } from "./seed";
import { UserId } from "../modules/user/model/user-user-id";
import { DataSource } from "typeorm";
import { UnAuthorized } from "../utilities/http-error";
import { UserEntity } from "../modules/user/entity/user.entity";
import { compare } from "bcrypt";
import { Username } from "../modules/user/model/user-username";
import { Password } from "../modules/user/model/user-password";

export const loginSeedUser = async (
  dataSource: DataSource
): Promise<{ userId: UserId; token: string }> => {
  const { userId, username, password } = await seedUser(
    dataSource,
    "ali" as Username,
    "Ali@1234" as Password
  );

  const userRepo = dataSource.getRepository(UserEntity);

  const user = await userRepo.findOne({ where: { username } });

  if (!user || (user && !(await compare(password, user.password))))
    throw new UnAuthorized("Seed user can not login!");

  const secretKey = process.env.SECRET_KEY ?? "super-secret";

  const token = jwt.sign({ username: user.username }, secretKey, {
    expiresIn: "1h",
  });

  return {
    userId: userId,
    token: token,
  };
};
