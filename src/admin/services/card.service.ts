import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card, CardStatus } from 'src/common/entities/card.entity';
import { maskCardNumber } from 'src/common/utils/maskCardNumber';
import { Repository } from 'typeorm';

@Injectable()
export class AdminCardService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
  ) {}

  async getAllCards(): Promise<Array<Card>> {
    const cards = await this.cardRepository.find();
    if (!cards) throw new NotFoundException({ message: 'Cards not found' });
    const updatedCards = cards.map((card) => {
      const { cardNumber } = card;
      const changedCardNumber = maskCardNumber(cardNumber);
      return { ...card, cvv: '***', cardNumber: changedCardNumber };
    });

    return updatedCards;
  }

  async getCardById(id: number) {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException({ message: 'Card not found' });
    return card;
  }

  async blockCard(cardId: number, statusMessage?: string) {
    return await this.cardRepository.save({
      id: cardId,
      status: CardStatus.BLOCKED,
      statusMessage: statusMessage || null,
    });
  }
}
