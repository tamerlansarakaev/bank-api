import { Body, Controller, Post, Res } from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';

@Controller('client/transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}
  @Post()
  async createTransaction(@Body() transactionData, @Res() res) {}
}
