import { Controller, Get } from '@nestjs/common';

@Controller('client/transactions')
export class TransactionsController {
  @Get()
  async getTransactions() {}
}
