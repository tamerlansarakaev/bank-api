import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { handleError } from 'src/common/utils/handles/handleError';
import { AdminTransactionService } from '../services/transaction.service';

@Controller('admin/transactions')
export class AdminTransactionController {
  constructor(private transactionService: AdminTransactionService) {}

  @Get()
  async getAllTransactions(@Res() res: Response) {
    try {
      const transactions = await this.transactionService.getAllTransactions();
      return res.status(200).json(transactions);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
