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
import { UserService } from 'src/client/services/users.service';
import { CardsService } from '../services/cards.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('client/cards')
export class CardsController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private UserService: UserService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private cardService: CardsService,
  ) {}

  @Post()
  async addCard(@Req() req, @Res() res) {
    try {
      const { email } = req.user;
      if (!email) throw new BadRequestException();
      const user = await this.UserService.getUserByEmail(email);
      if (!user) throw new NotFoundException('User Not Found');
      const createdCard = await this.cardService.addCard(
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
      const profile = await this.UserService.getUserByEmail(email);
      const cards = await this.cardService.getCardsUser(profile.cardList);

      return res.status(200).json({ cards: [...cards] });
    } catch (error) {
      res.status(error.status || 500).json(error.response.errors || error);
    }
  }

  @Get(':id')
  async getCard(@Res() res, @Param('id', ParseIntPipe) cardId: number) {
    try {
      const card = await this.cardService.getCard(cardId);

      return res.status(200).json(card);
    } catch (err) {
      return res.status(500).json();
    }
  }
}
