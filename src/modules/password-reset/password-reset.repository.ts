import { DataSource, Repository } from "typeorm";
import { PasswordResetToken } from "./model/token";
import { PasswordResetEntity } from "./entity/password-reset.entity";
import { PasswordReset } from "./model/password-reset.model";

export interface IPasswordResetRepository {
  create(fields: PasswordReset): Promise<PasswordReset | null>;
  findToken(token: PasswordResetToken): Promise<PasswordReset | null>;
  deleteToken(token: PasswordResetToken): Promise<boolean>;
}

export class PasswordResetRepository implements IPasswordResetRepository {
  private repo: Repository<PasswordResetEntity>;
  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(PasswordResetEntity);
  }

  async create(fields: PasswordReset): Promise<PasswordReset | null> {
    return await this.repo.save(fields);
  }

  async findToken(token: PasswordResetToken): Promise<PasswordReset | null> {
    return await this.repo.findOne({
      where: { token },
      relations: { user: true },
    });
  }

  async deleteToken(token: PasswordResetToken): Promise<boolean> {
    const result = await this.repo.delete({ token });
    return Boolean(result.affected);
  }
}
