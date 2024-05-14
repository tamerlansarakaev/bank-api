import { Controller, Get } from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';

@Controller('client/transactions')
export class TransactionsController {
  constructor(transactionsService: TransactionsService) {}
  @Get()
  async getTransactions() {}
}
