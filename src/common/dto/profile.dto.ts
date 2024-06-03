import { ApiProperty } from '@nestjs/swagger';
import { Card } from '../entities/card.entity';

export class ProfileDto {
  @ApiProperty({ type: [Card] })
  cardList: Card[];

  @ApiProperty()
  balance: number;

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
