import {
  Controller,
  Inject,
  Post,
  Req,
  Res,
  forwardRef,
  Get,
} from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { CardsService } from './cards.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Controller('cards')
export class CardsController {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private cardService: CardsService,
  ) {}

  @Post()
  async addCard(@Req() req, @Res() res) {
    try {
      const { email } = req.user;
      const user = await this.usersService.getUserByEmail(email);
      const createdCard = await this.cardService.addCard(
        user.id,
        user.name,
        user.surname,
      );
      user.cardList.push(createdCard.id);
      await this.userRepository.save({ ...user });
      const profile = await this.usersService.getProfile(user.id);
      return res.status(200).json(profile);
    } catch (error) {
      console.log(error);
      return res.status(error.status).json(error.response.errors || error);
    }
  }

  @Get()
  async getCards(@Req() req, @Res() res) {
    try {
      const { email } = req.user;
      const profile = await this.usersService.getUserByEmail(email);
      const cards = await this.cardService.getCardsUser(profile.cardList);

      return res.status(200).json({ cards: [...cards] });
    } catch (error) {
      res.status(error.status || 500).json(error.response.errors || error);
    }
  }
}
