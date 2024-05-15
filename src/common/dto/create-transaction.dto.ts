import { Currency } from '../entities/card.entity';
import { TransactionStatuses, TransactionTypes } from '../entities/transaction.entity';

export class CreateTransactionDto {
  readonly receiverCardId: number;
  readonly senderCardId?: number;
  readonly amount: number;
  readonly currency: Currency;
  readonly status?: TransactionStatuses;
  readonly statusMessage?: string;
  readonly type: TransactionTypes;
}
