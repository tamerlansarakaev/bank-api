import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/client/services/users.service';
import { CardsService } from '../services/cards.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('client/cards')
export class CardsController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private UsersService: UsersService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private cardsService: CardsService,
  ) {}

  @Post()
  async addCard(@Req() req, @Res() res) {
    try {
      const { email } = req.user;
      if (!email) throw new BadRequestException();
      const user = await this.UsersService.getUserByEmail(email);
      if (!user) throw new NotFoundException('User Not Found');
      const createdCard = await this.cardsService.addCard(
        user.id,
        user.name,
        user.surname,
      );
      user.cardList.push(createdCard.id);
      await this.userRepository.save({ ...user });
      return res.status(200).json(createdCard);
    } catch (error) {
      console.log(error);
      return res.status(error.status).json(error.response.errors || error);
    }
  }

  @Get()
  async getCards(@Req() req, @Res() res) {
    try {
      const { email } = req.user;
      const profile = await this.UsersService.getUserByEmail(email);
      const cards = await this.cardsService.getCardsUser(profile.cardList);

      return res.status(200).json({ cards: [...cards] });
    } catch (error) {
      res.status(error.status || 500).json(error.response.errors || error);
    }
  }

  @Get(':id')
  async getCard(
    @Req() req,
    @Res() res,
    @Param('id', ParseIntPipe) cardId: number,
  ) {
    try {
      const userId = req.user.id;
      console.log(userId);
      const card = await this.cardsService.getCard(cardId, userId);
      return res.status(200).json(card);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  }

  @Get(':id/transactions')
  async getTransactions(
    @Param('id', ParseIntPipe) cardId: number,
    @Req() req,
    @Res() res,
  ) {
    try {
      const transactions = await this.cardsService.getCardTransactions(cardId);

      return res.status(200).json({ transactions: [...transactions] });
    } catch (err) {
      return res.status(500).json(err);
    }
  }
}
