import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { validate } from 'class-validator';
import { CreateTransactionDto } from 'src/common/dto/create-transaction.dto';
import {
  Transaction,
  TransactionStatuses,
} from 'src/common/entities/transaction.entity';
import { ISetTransactionStatus } from 'src/common/interfaces/setTransactionStatus';
import { reddisHelper } from 'src/common/utils/reddis';
import { Repository } from 'typeorm';

@Injectable()
export class ClientTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    const createdTransaction =
      await this.transactionRepository.save(transaction);

    await this.cacheManager.set(
      reddisHelper.transactionKey(createdTransaction.id),
      createdTransaction,
    );

    return createdTransaction;
  }

  async setStatusTransaction({ transactionId, status }: ISetTransactionStatus) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    transaction.status = status;
    await this.cacheManager.del(reddisHelper.transactionKey(transaction.id));
    return await this.transactionRepository.save(transaction);
  }
}
