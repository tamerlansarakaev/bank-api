import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { handleError } from 'src/common/utils/handles/handleError';
import { AdminTransactionService } from '../services/transaction.service';
import {
  Transaction,
  TransactionStatuses,
} from 'src/common/entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin/transactions')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class AdminTransactionController {
  constructor(
    private transactionService: AdminTransactionService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Return all Transactions',type:[Transaction] })
  async getAllTransactions(@Res() res: Response) {
    try {
      const transactions = await this.transactionService.getAllTransactions();
      return res.status(200).json(transactions);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Patch(':id/confirm')
  @ApiResponse({ status: 200, description: 'Transaction confirmed' })
  async confirmTransaction(
    @Param('id', ParseIntPipe) transactionId: number,
    @Res() res: Response,
  ) {
    try {
      const confirmedTransaction =
        await this.transactionService.confirmTransaction(transactionId);

      return res.status(200).json(confirmedTransaction);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Patch(':id/reject')
  @ApiResponse({ status: 200, description: 'Transaction rejected' })
  async rejectTransaction(
    @Param('id', ParseIntPipe) transactionId: number,
    @Res() res: Response,
  ) {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
      });
      if (transaction.status === TransactionStatuses.COMPLETED)
        throw new BadRequestException({
          message: `You can't change transaction with status: ${transaction.status}`,
        });

      const rejectedTransaction =
        await this.transactionService.setStatusTransaction(
          transactionId,
          TransactionStatuses.DENIED,
        );

      return res.status(200).json(rejectedTransaction);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
