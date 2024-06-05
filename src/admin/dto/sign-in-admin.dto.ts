import { ApiProperty } from "@nestjs/swagger";

export class SignInAdminDto {
  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly password: string;
}
