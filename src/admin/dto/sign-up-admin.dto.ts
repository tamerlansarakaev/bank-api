import { Role } from '../entities/admin.entity';

export class SignUpAdminDto {
  readonly email: string;
  readonly username: string;
  readonly password: string;
}
