import { Controller } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('client/transactions')
export class TransactionController {
  constructor(private TransactionService: TransactionService) {}
}
