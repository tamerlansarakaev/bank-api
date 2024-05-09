import { Controller, Inject, Post, Req, forwardRef } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { CardsService } from './cards.service';

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
      const { id } = req.user;
      const createdCard = await this.cardService.addCardByUserId(id);
      const user = await this.usersService.getProfile(id);

      return user;
    } catch (error) {}
  }
}
