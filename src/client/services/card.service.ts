import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card, Currency } from '../../common/entities/card.entity';
import { Transaction } from '../../common/entities/transaction.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CreateCardDTO } from '../../common/dto/create-card.dto';
import { ClientTransactionService } from './transaction.service';
import {
  TransactionStatuses,
  TransactionTypes,
} from 'src/common/entities/transaction.entity';

@Injectable()
export class ClientCardService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private transactionService: ClientTransactionService,
  ) {}

  generateRandomNumber(length) {
    let min = Math.pow(10, length - 1);
    let max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async addCard(userId, name, surname): Promise<Card> {
    let currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 5);
    const cardData: CreateCardDTO = {
      name,
      surname,
      cvv: this.generateRandomNumber(3).toString(),
      cardNumber: this.generateRandomNumber(16).toString(),
      userId,
      expirationDate: currentDate,
      currency: Currency.USD,
    };
    const card = new Card();
    Object.assign(card, cardData);

    const validationErrors = await validate(card).then((errors) =>
      errors.map((error) => error.constraints),
    );

    if (validationErrors.length) {
      throw new BadRequestException({ errors: validationErrors });
    }
    return await this.cardRepository.save(card);
  }

  async getCardsByCardId(cardsId: Array<number>) {
    const cardList: Array<Card> = [];
    if (!cardsId) {
      return null;
    }
    for (const cardId of cardsId) {
      const card = await this.cardRepository.findOne({ where: { id: cardId } });
      if (!card) continue;
      cardList.push(card);
    }
    if (!cardList.length) {
      return null;
    }
    return cardList;
  }

  async getCard(id: number, userId: number) {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException({ message: 'Card not found' });
    if (card.userId === userId) {
      return card;
    } else {
      throw new Error('its not your card');
    }
  }

  async getCardTransactions(cardId: number) {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    const transactions = card.transactions;
    const resultTransaction = transactions.map(
      async (id) => await this.transactionRepository.find({ where: { id } }),
    );
    return resultTransaction;
  }

  async getCardByCardNumber(
    cardNumber: string,
    userId: number,
  ): Promise<Card | null> {
    const card = await this.cardRepository.findOne({
      where: { cardNumber, userId },
    });
    return card || null;
  }

  async verifyCardOwnership(userId, cardId): Promise<boolean> {
    const card = await this.getCard(cardId, userId);
    if (!card) return false;
    return true;
  }

  async sendMoneyByCardsId(
    userId: number,
    amount: number,
    senderCardId: number,
    receiverCardNumber: string,
    currency: Currency,
  ) {
    if (!senderCardId)
      throw new BadRequestException({ message: "SenderCardId can't be empty" });

    const validate = await this.verifyCardOwnership(userId, senderCardId);

    if (!validate)
      throw new BadRequestException({ message: "It isn't your card" });

    const senderCard = await this.getCard(senderCardId, userId);
    const receiverCard = await this.getCardByCardNumber(
      receiverCardNumber,
      userId,
    );

    if (!receiverCard)
      throw new NotFoundException({ message: 'Receiver Card not found' });
    if (senderCard.balance - amount < 0)
      throw new Error('Not enought money on card');

    const currenciesValidate = this.validateCurrency([
      senderCard.currency,
      receiverCard.currency,
    ]);

    if (!currenciesValidate)
      throw new BadRequestException({
        message: 'Card currencies are different ',
      });

    senderCard.balance = senderCard.balance - amount;
    const transaction = await this.transactionService.createTransaction({
      amount,
      senderCardNumber: senderCard.cardNumber,
      receiverCardNumber: receiverCard.cardNumber,
      type: TransactionTypes.SEND,
      currency,
      status: TransactionStatuses.PENDING,
    });

    if (!transaction) return;
    // Add transaction to card
    senderCard.transactions.push(transaction.id);

    await this.cardRepository.save(senderCard);
    return transaction;
  }

  async confirmSendTransaction(transaction: Transaction) {
    const randomTimeForTimeout = Math.floor(
      Math.random() * (10000 - 5000) + 5000,
    );
    const receiverCard = await this.cardRepository.findOne({
      where: { cardNumber: transaction.receiverCardNumber },
    });
    setTimeout(async () => {
      receiverCard.balance = receiverCard.balance + transaction.amount;
      receiverCard.transactions.push(transaction.id);
      await this.transactionService.setStatusTransaction(
        transaction.id,
        TransactionStatuses.COMPLETED,
      );
      await this.cardRepository.save(receiverCard);
    }, randomTimeForTimeout);
  }

  async validateCurrency(currency: Currency[]) {
    let status = true;
    currency.map((el, i) => {
      if (el !== currency[i]) {
        status = false;
      }
    });
    return status;
  }
}
