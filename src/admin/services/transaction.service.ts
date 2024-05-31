import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { errorMessages } from 'src/common/constants';
import { Card } from 'src/common/entities/card.entity';
import {
  Transaction,
  TransactionStatuses,
} from 'src/common/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Card) private cardRepository: Repository<Card>,
  ) {}

  async getAllTransactions(): Promise<Array<Transaction>> {
    const transactions = await this.transactionRepository.find();
    if (!transactions)
      throw new NotFoundException({ message: 'Transactions not found' });

    return transactions;
  }

  async confirmTransaction(transactionId) {
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
    return updatedTransaction;
  }
}
