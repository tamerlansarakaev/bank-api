import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private readonly cardRepository: Repository<Card>,
  ) {}

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
}
