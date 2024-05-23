import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Res,
  Get,
  Req,
} from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';

@Controller('client/transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}
  @Post()
  async createTransaction(@Body() transactionData, @Res() res) {}

  @Get(':id')
  async getTransactionInfo(
    @Param('id', ParseIntPipe) transactionId: number,
    @Req() req,
    @Res() res,
  ) {
    try {
    } catch {}
  }
}
