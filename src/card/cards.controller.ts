import {
  BadRequestException,
  Controller,
  Inject,
  NotFoundException,
  Post,
  Req,
  Res,
  forwardRef,
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
      if (!email) throw new BadRequestException();
      const user = await this.usersService.getUserByEmail(email);
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
}
