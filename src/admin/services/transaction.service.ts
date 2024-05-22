import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/common/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getAllTransactions(): Promise<Array<Transaction>> {
    const transactions = await this.transactionRepository.find();
    if (!transactions)
      throw new NotFoundException({ message: 'Transactions not found' });

    return transactions;
  }
}
