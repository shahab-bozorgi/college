import { v4 } from "uuid";
import { TestDataSource } from "./data-source";
import { UserEntity } from "./modules/user/entity/user.entity";

export const seedUser = async () => {
  const userRepo = TestDataSource.getRepository(UserEntity);

  const count = await userRepo.count();

  if (count === 0) {
    await userRepo.save([
      {
        id: v4(),
        username: "ali",
        password: "ali1234",
        email: "alialavi@gmail.com",
        avatar_url: "",
      },
    ]);
  }
};
