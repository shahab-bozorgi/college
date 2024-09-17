import { v4 } from "uuid";
import { DataSource, Repository } from "typeorm";
import { CreateActionDto } from "./dto/create-action.dto";
import { ActionEntity } from "./entity/action.entity";
import { Action } from "./model/action.model";

export interface IActionRepository {
  create(dto: CreateActionDto): Promise<Action>;
}

export class ActionRepository implements IActionRepository {
  private repo: Repository<ActionEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(ActionEntity);
  }

  async create(dto: CreateActionDto): Promise<Action> {
    const { mediaId, ...rest } = dto;
    return await this.repo.save({
      id: v4(),
      ...rest,
      ...(mediaId !== null && { mediaId }),
    });
  }
}
