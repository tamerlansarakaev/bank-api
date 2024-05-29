import { Currency } from '../entities/card.entity';
import {
  TransactionStatuses,
  TransactionTypes,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  readonly receiverCardNumber: string;
  readonly senderCardNumber?: string;
  readonly amount: number;
  readonly currency: Currency;
  readonly status?: TransactionStatuses;
  readonly statusMessage?: string;
  readonly type: TransactionTypes;
  readonly date?: Date;
}
