import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '../entities/card.entity';
import {
  TransactionStatuses,
  TransactionTypes,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty()
  readonly receiverCardNumber: string;

  @ApiPropertyOptional()
  readonly senderCardNumber?: string;

  @ApiProperty()
  readonly amount: number;

  @ApiProperty()
  readonly currency: Currency;

  @ApiPropertyOptional()
  readonly status?: TransactionStatuses;

  @ApiPropertyOptional()
  readonly statusMessage?: string;

  @ApiProperty()
  readonly type: TransactionTypes;

  @ApiPropertyOptional()
  readonly date?: Date;
}
