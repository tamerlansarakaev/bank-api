import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card, Currency } from '../../common/entities/card.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CreateCardDTO } from '../../common/dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
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
    card.name = cardData.name;
    card.surname = cardData.surname;
    card.cardNumber = cardData.cardNumber.toString();
    card.cvv = cardData.cvv;
    card.userId = cardData.userId;
    card.expirationDate = cardData.expirationDate;
    card.currency = cardData.currency;
    const validationErrors = await validate(card);

    if (validationErrors.length) {
      throw new BadRequestException({ errors: validationErrors });
    }
    return await this.cardRepository.save(card);
  }

  async getCardsUser(cardsId: Array<number>) {
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
}
