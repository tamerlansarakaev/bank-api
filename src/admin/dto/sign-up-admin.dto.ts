import { ApiProperty } from '@nestjs/swagger';

export class SignUpAdminDto {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly password: string;
}
