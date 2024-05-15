import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { CreateTransactionDto } from 'src/common/dto/create-transaction.dto';
import {
  Transaction,
  TransactionStatuses,
} from 'src/common/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(transactionData: CreateTransactionDto) {
    const data: CreateTransactionDto = {
      amount: transactionData.amount,
      receiverCardId: transactionData.receiverCardId,
      senderCardId: transactionData.senderCardId || null,
      currency: transactionData.currency,
      type: transactionData.type,
      status: transactionData.status || TransactionStatuses.PENDING,
    };

    // Create transaction
    const transaction = new Transaction();
    const errors = await validate(transaction).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException(errors);

    // Copy transaction data to transaction
    Object.assign(transaction, data);

    return await this.transactionRepository.create(transaction);
  }
}
