import { CreateActionDto } from "./dto/create-action.dto";
import { IActionRepository } from "./action.repository";

export class ActionService {
  constructor(private actionRepo: IActionRepository) {}
  async createAction(dto: CreateActionDto) {
    return await this.actionRepo.create(dto);
  }
}
