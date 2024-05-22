import { Controller } from '@nestjs/common';
import { ClientTransactionService } from '../services/transaction.service';

@Controller('client/transactions')
export class ClientTransactionController {
  constructor(private ClientTransactionService: ClientTransactionService) {}
}
