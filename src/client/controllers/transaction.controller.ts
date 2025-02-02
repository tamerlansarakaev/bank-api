import {
  Controller,
  Param,
  ParseIntPipe,
  Res,
  Get,
  Req,
} from '@nestjs/common';
import { ClientTransactionService } from '../services/transaction.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Client')
@ApiResponse({status: 401, description: "Unauthorized"})
@ApiBearerAuth()
@Controller('client/transactions')
export class ClientTransactionController {
  constructor(private transactionsService: ClientTransactionService) {}

  @Get(':id')
  async getTransactionInfo(
    @Param('id', ParseIntPipe) transactionId: number,
    @Req() req,
    @Res() res,
  ) {
    try {
      const { id } = req.user;
      const transaction = this.transactionsService.getTransactionById(
        transactionId,
        id,
      );
      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(error.status || 401).json({ message: error.message });
    }
  }
}
