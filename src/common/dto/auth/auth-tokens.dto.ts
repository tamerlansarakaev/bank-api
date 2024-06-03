import { ApiProperty } from '@nestjs/swagger';

export class AuthTokens {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
