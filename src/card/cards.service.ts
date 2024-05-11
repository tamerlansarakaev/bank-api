import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card, currency } from './card.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CreateCardDTO } from './dto/create-card.dto';

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
    const cardData: CreateCardDTO = {
      name,
      surname,
      cvv: this.generateRandomNumber(3),
      cardNumber: this.generateRandomNumber(16),
      userId,
      expirationDate: new Date(new Date().getFullYear() + 3),
      currency: currency.USD,
    };
    const card = new Card();
    card.name = cardData.name;
    card.surname = cardData.surname;
    card.cvv = cardData.cvv;
    card.userId = cardData.userId;
    card.cardNumber = cardData.cardNumber.toString();
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
    console.log(cardsId);
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

  async getCard(id) {
    const card = await this.cardRepository.findOne({ where: { id: id } });
    return card;
  }
}
