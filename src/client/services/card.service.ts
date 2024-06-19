import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card, CardStatus, Currency } from '../../common/entities/card.entity';
import { Transaction } from '../../common/entities/transaction.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CreateCardDTO } from '../../common/dto/card/create-card.dto';
import { ClientTransactionService } from './transaction.service';
import {
  TransactionStatuses,
  TransactionTypes,
} from 'src/common/entities/transaction.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IDepositData } from 'src/common/interfaces/depositData';
import { ISendData } from 'src/common/interfaces/sendData';
import { ICreateCard } from 'src/common/interfaces/createCardData';
import { cacheHelper } from 'src/common/utils/cache';

@Injectable()
export class ClientCardService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async generateCardNumber() {
    const cardNumber = this.generateRandomNumber(16).toString();
    const validate = await this.cardRepository.find({
      where: { cardNumber },
    });
    if (validate.length) {
      return this.generateCardNumber();
    }
    return cardNumber;
  }

  async addCard({ userId, name, surname }: ICreateCard): Promise<Card> {
    let currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 5);
    const cardData: CreateCardDTO = {
      name,
      surname,
      cvv: this.generateRandomNumber(3).toString(),
      cardNumber: this.generateCardNumber(),
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

  async getCard({ id, userId }) {
    const cacheCard: Card = await this.cacheManager.get(
      cacheHelper.cardKey(id),
    );

    if (cacheCard && cacheCard.userId === userId) {
      return cacheCard;
    }

    const card = await this.cardRepository.findOne({ where: { id } });

    if (!card) throw new NotFoundException({ message: 'Card not found' });
    if (card.userId === userId) {
      await this.cacheManager.set(cacheHelper.cardKey(card.id), card);
      return card;
    } else {
      throw new Error('its not your card');
    }
  }

  async getCardTransactions(cardId: number) {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    const transactions = card.transactions;

    const resultTransaction = [];
    for (const transactionId of transactions) {
      const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
      });
      resultTransaction.push(transaction);
    }
    return resultTransaction;
  }

  async getCardByCardNumber(
    cardNumber: string,
    userId: number,
  ): Promise<Card | null> {
    const cacheCard: Card = await this.cacheManager.get(
      `card-cardNumber-${cardNumber}`,
    );
    if (cacheCard && cacheCard.userId === userId) return cacheCard;
    const card = await this.cardRepository.findOne({
      where: { cardNumber, userId },
    });

    await this.cacheManager.set(`card-cardNumber-${cardNumber}`, card);

    return card || null;
  }

  async verifyCard({ userId, cardId }) {
    const card = await this.getCard({ id: cardId, userId });

    if (!card || card.status === CardStatus.BLOCKED)
      throw new BadRequestException({
        message: "It's not your card or Card is blocked",
      });

    return card;
  }

  async sendMoney({
    userId,
    amount,
    senderCardId,
    receiverCardNumber,
    currency,
  }: ISendData) {
    if (!senderCardId)
      throw new BadRequestException({ message: "SenderCardId can't be empty" });

    const senderCard = await this.verifyCard({ cardId: senderCardId, userId });

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
    await this.cacheManager.del(cacheHelper.cardKey(senderCard.id));
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
      await this.transactionService.setStatusTransaction({
        transactionId: transaction.id,
        status: TransactionStatuses.COMPLETED,
      });

      await this.cardRepository.save(receiverCard);
      await this.cacheManager.del(cacheHelper.cardKey(receiverCard.id));
      return;
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

  async deposit({ userId, cardId, amount, currency }: IDepositData) {
    const card = await this.verifyCard({ cardId, userId });
    const validateCurrency = await this.validateCurrency([
      currency,
      card.currency,
    ]);

    if (!validateCurrency)
      throw new BadRequestException({
        message: 'Currency is different',
        cardCurrency: card.currency,
        receiverCurrency: currency,
      });

    const transaction = await this.transactionService.createTransaction({
      receiverCardNumber: card.cardNumber,
      amount,
      currency,
      status: TransactionStatuses.ACTIVE,
      type: TransactionTypes.DEPOSIT,
    });
    card.transactions.push(transaction.id);

    await this.cardRepository.save(card);
    await this.cacheManager.del(cacheHelper.cardKey(card.id));

    return transaction;
  }
}
