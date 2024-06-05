import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../entities/card.entity';

export class CreateCardDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  cardNumber: string;

  @ApiProperty()
  cvv: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  expirationDate: Date;

  @ApiProperty()
  currency: Currency;
}
