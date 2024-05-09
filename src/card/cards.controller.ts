import {
  Controller,
  Inject,
  Post,
  Req,
  forwardRef,
  Get,
  Res,
} from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { CardsService } from './cards.service';
// import { Repository } from 'typeorm';
// import { User } from 'src/user/user.entity';

@Controller('cards')
export class CardsController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private cardService: CardsService,
  ) {}

  @Post()
  async addCard(@Req() req) {
    try {
      const { id, email } = req.user;
      const createdCard = await this.cardService.addCardByUserId(id);
      const user = await this.usersService.getUserByEmail(email);

      user.cardList.push(createdCard.id);

      return user;
    } catch (error) {}
  }

  @Get()
  async getCards(@Req() req, @Res() res) {
    try {
      const { email } = req.user;
      const profile = await this.usersService.getUserByEmail(email);
      const cards = await this.cardService.getCardsUser(profile.cardList);

      return cards;
    } catch (error) {
      res.status(error.status || 500).json(error.response.errors || error);
    }
  }
}
