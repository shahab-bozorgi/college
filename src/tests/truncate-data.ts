import { ObjectLiteral, Repository } from "typeorm";

export const truncateTableOfRepos = async (
  repositories: Repository<ObjectLiteral>[]
): Promise<void> => {
  for (const repository of repositories) {
    await repository.query("SET FOREIGN_KEY_CHECKS = 0");
    await repository.query(`TRUNCATE TABLE ${repository.metadata.tableName}`);
    await repository.query("SET FOREIGN_KEY_CHECKS = 1");
  }
};
