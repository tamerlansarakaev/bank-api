import { Role } from '../entities/admin.entity';

export class AdminDto {
  readonly id: number;
  readonly roles: Array<Role>;
}
