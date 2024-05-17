import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card, Currency } from '../../common/entities/card.entity';
import { Transaction } from '../../common/entities/transaction.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CreateCardDTO } from '../../common/dto/create-card.dto';
import { TransactionsService } from './transactions.service';
import {
  TransactionStatuses,
  TransactionTypes,
} from 'src/common/entities/transaction.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private transactionsService: TransactionsService,
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
      cvv: this.generateRandomNumber(3),
      cardNumber: this.generateRandomNumber(16),
      userId,
      expirationDate: currentDate,
      currency: Currency.USD,
    };
    const card = new Card();
    Object.assign(card, cardData);

    const validationErrors = await validate(card);

    if (validationErrors.length) {
      throw new BadRequestException({ errors: validationErrors });
    }
    return await this.cardRepository.save(card);
  }

  async getCards(cardsId: Array<number>) {
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

  async verifyCardOwnership(userId, cardId): Promise<boolean> {
    const card = await this.getCard(cardId, userId);
    if (!card) return false;
    return true;
  }

  async sendMoneyByCardsId(
    userId: number,
    amount: number,
    senderCardId: number,
    receiverCardId: number,
    currency: Currency,
  ) {
    if (!senderCardId)
      throw new BadRequestException({ message: "SenderCardId can't be empty" });

    const validate = await this.verifyCardOwnership(userId, senderCardId);

    if (!validate)
      throw new BadRequestException({ message: "It isn't your card" });

    const [senderCard, receiverCard] = await this.getCards([
      senderCardId,
      receiverCardId,
    ]);

    const transaction = await this.transactionsService.createTransaction({
      amount,
      senderCardNumber: senderCard.cardNumber,
      receiverCardNumber: receiverCard.cardNumber,
      type: TransactionTypes.SEND,
      currency,
      status: TransactionStatuses.PENDING,
    });
    senderCard.transactions.push(transaction.id);

    return transaction;
  }
}
