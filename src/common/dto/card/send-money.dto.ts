import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../entities/card.entity';

export class SendMoneyDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: Currency;

  @ApiProperty()
  receiverCardNumber: string;
}
