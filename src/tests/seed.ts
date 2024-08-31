import { v4 } from "uuid";
import { hash } from "bcrypt";
import { AppDataSource } from "../data-source";
import { UserEntity } from "../modules/user/entity/user.entity";
import { UserId } from "../modules/user/model/user-user-id";
import { Username } from "../modules/user/model/user-username";
import { DataSource } from "typeorm";
import { User } from "../modules/user/model/user.model";
import { Email } from "../data/email";
import { PostEntity } from "../modules/post/entity/post.entity";
import { PostId } from "../modules/post/model/post-id";
import { MediaEntity } from "../modules/media/media.entity";
import { TagEntity } from "../modules/tag/tag.entity";
import { extractTag } from "../modules/tag/field-types/tag-title";

export const seedUser = async () => {
  const userRepo = AppDataSource.getRepository(UserEntity);

  const count = await userRepo.count();

  if (count === 0) {
    return await userRepo.save({
      id: v4() as UserId,
      username: "ali" as Username,
      password: await hash("Ali@1234", 12),
      email: "alialavi@gmail.com",
    });
  }
};

export const seedPost = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(UserEntity);
  const user_1: User = {
    id: v4() as UserId,
    username: "user1" as Username,
    email: "user1@gmail.com" as Email,
    password: "User1234",
  };
  const user_2: User = {
    id: v4() as UserId,
    username: "user2" as Username,
    email: "user2@gmail.com" as Email,
    password: "User1234",
  };
  const author: User = {
    id: v4() as UserId,
    username: "author" as Username,
    email: "author@gmail.com" as Email,
    password: "Author1234",
  };
  await userRepo.save([author, user_1, user_2]);

  const mediaRepo = dataSource.getRepository(MediaEntity);
  const post_1 = {
    id: v4() as PostId,
    author,
    caption: "This is a caption without tags and mentions.",
    media: await mediaRepo.save(
      [1, 2, 3].map((i) => {
        return {
          id: v4(),
          name: `imageName_${i}.jpg`,
          mime: "image/jpg",
          path: `uploads/posts/imageName_${i}.jpg`,
          size: 1000000,
        };
      })
    ),
  };

  const post_2 = {
    id: v4() as PostId,
    author,
    caption: "This is a caption without tags.",
    mentions: [user_1, user_2],
    media: await mediaRepo.save(
      [1, 2, 3].map((i) => {
        return {
          id: v4(),
          name: `imageName_${i}.jpg`,
          mime: "image/jpg",
          path: `uploads/posts/imageName_${i}.jpg`,
          size: 1000000,
        };
      })
    ),
  };

  const tagRepo = dataSource.getRepository(TagEntity);
  const post_3 = {
    id: v4() as PostId,
    author,
    caption: "This is a caption with #tag_1 and #tag_2",
    mentions: [user_1],
    tags: await tagRepo.save(
      extractTag("This is a caption with #tag_1 and #tag_2").map((title) => {
        return { title };
      })
    ),
    media: await mediaRepo.save(
      [1, 2, 3].map((i) => {
        return {
          id: v4(),
          name: `imageName_${i}.jpg`,
          mime: "image/jpg",
          path: `uploads/posts/imageName_${i}.jpg`,
          size: 1000000,
        };
      })
    ),
  };

  const postRepo = dataSource.getRepository(PostEntity);
  await postRepo.save([post_1, post_2, post_3]);
};
