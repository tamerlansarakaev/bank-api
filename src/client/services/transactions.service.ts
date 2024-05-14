import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionTypes,
} from 'src/common/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(
    cardId: number,
    type: TransactionTypes.SEND | TransactionTypes.DEPOSIT,
  ) {
    switch (type) {
    }
  }
}
