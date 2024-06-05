import { ApiProperty } from "@nestjs/swagger";

export class SignUpDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
