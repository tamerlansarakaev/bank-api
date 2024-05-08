import { Controller, Post, Req } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('cards')
export class CardsController {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
  ) {}

  @Post()
  async addCard(@Req() req, userId) {
    console.log(req.user);

    return true;
  }
}
