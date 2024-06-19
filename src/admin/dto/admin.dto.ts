import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/admin.entity';

export class AdminDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly roles: Array<Role>;
}
