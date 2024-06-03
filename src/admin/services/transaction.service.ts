import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { errorMessages } from 'src/common/constants';
import { Card } from 'src/common/entities/card.entity';
import {
  Transaction,
  TransactionStatuses,
} from 'src/common/entities/transaction.entity';
import { reddisHelper } from 'src/common/utils/reddis';
import { Repository } from 'typeorm';

@Injectable()
export class AdminTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Card) private cardRepository: Repository<Card>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAllTransactions(): Promise<Array<Transaction>> {
    const transactions = await this.transactionRepository.find({ cache: true });
    if (!transactions.length)
      throw new NotFoundException({ message: 'Transactions not found' });
    return transactions;
  }

  async confirmTransaction(transactionId: number) {
    const { RECEIVER_CARD_NOT_FOUND, TRANSACTION_NOT_FOUND } = errorMessages;
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction)
      throw new NotFoundException({ message: TRANSACTION_NOT_FOUND });

    if (transaction.status !== TransactionStatuses.ACTIVE)
      throw new BadRequestException({
        message: `You can confirm only transactions with status: ${TransactionStatuses.ACTIVE}`,
      });

    const card = await this.cardRepository.findOne({
      where: { cardNumber: transaction.receiverCardNumber },
    });

    if (!card)
      throw new NotFoundException({
        message: RECEIVER_CARD_NOT_FOUND,
      });

    if (!(transaction.currency === card.currency))
      throw new BadRequestException({ message: 'Currencies is different' });

    await this.cardRepository.save({
      id: card.id,
      balance: card.balance + transaction.amount,
    });

    const confirmedTransaction = await this.setStatusTransaction(
      transactionId,
      TransactionStatuses.COMPLETED,
    );

    return confirmedTransaction;
  }

  async setStatusTransaction(transactionId, status: TransactionStatuses) {
    const updatedTransaction = await this.transactionRepository.save({
      id: transactionId,
      status,
    });

    await this.cacheManager.del(
      reddisHelper.transactionKey(updatedTransaction.id),
    );
    return updatedTransaction;
  }
}
