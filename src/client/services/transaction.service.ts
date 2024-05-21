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
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(transactionData: CreateTransactionDto) {
    const data: CreateTransactionDto = {
      amount: transactionData.amount,
      receiverCardNumber: transactionData.receiverCardNumber,
      senderCardNumber: transactionData.senderCardNumber || null,
      currency: transactionData.currency,
      type: transactionData.type,
      status: transactionData.status || TransactionStatuses.PENDING,
      date: new Date(),
    };

    // Create transaction
    const transaction = new Transaction();

    // Copy transaction data to transaction
    Object.assign(transaction, data);

    const errors = await validate(transaction).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException(errors);

    return await this.transactionRepository.save(transaction);
  }

  async setStatusTransaction(
    transactionId: number,
    status: TransactionStatuses,
  ) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    transaction.status = status;

    return await this.transactionRepository.save(transaction);
  }
}
