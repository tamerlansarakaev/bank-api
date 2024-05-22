import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from 'src/common/entities/card.entity';
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
      return { ...card, cvv: '***' };
    });

    return updatedCards;
  }
}
