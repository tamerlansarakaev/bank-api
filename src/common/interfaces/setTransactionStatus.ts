import { TransactionStatuses } from "../entities/transaction.entity";

export interface ISetTransactionStatus {
  transactionId: number;
  status: TransactionStatuses;
}
