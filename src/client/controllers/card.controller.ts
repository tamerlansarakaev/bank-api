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
import { ClientUserService } from 'src/client/services/user.service';
import { ClientCardService } from '../services/card.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { handleError } from 'src/common/handles/handleError';

@Controller('client/cards')
export class ClientCardController {
  constructor(
    @Inject(forwardRef(() => ClientUserService))
    private userService: ClientUserService,

    @InjectRepository(User) private userRepository: Repository<User>,
    private CardService: ClientCardService,
  ) {}

  @Post()
  async addCard(@Req() req, @Res() res: Response) {
    try {
      const { email } = req.user;
      if (!email) throw new BadRequestException();
      const user = await this.userService.getUserByEmail(email);
      if (!user) throw new NotFoundException('User Not Found');
      const createdCard = await this.CardService.addCard(
        user.id,
        user.name,
        user.surname,
      );
      user.cardList.push(createdCard.id);
      await this.userRepository.save({ ...user });

      return res.status(200).json(createdCard);
    } catch (error) {
      console.log(error);
      return handleError(res, error);
    }
  }

  @Get()
  async getCards(@Req() req, @Res() res: Response) {
    try {
      const { email } = req.user;
      const profile = await this.userService.getUserByEmail(email);
      const cards = await this.CardService.getCardsByCardId(profile.cardList);

      return res.status(200).json({ cards: [...cards] });
    } catch (error) {
      console.log(error);
      return handleError(res, error);
    }
  }

  @Get(':id')
  async getCard(
    @Req() req,
    @Res() res: Response,
    @Param('id', ParseIntPipe) cardId: number,
  ) {
    try {
      const userId = req.user.id;
      const card = await this.CardService.getCard(cardId, userId);
      console.log(1)
      return res.status(200).json(card);
    } catch (err) {
      return handleError(res, err);
    }
  }

  @Post(':cardId/send')
  async sendMoneyFromCard(
    @Param('cardId', ParseIntPipe) senderCardId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const { id } = req.user;
      const { amount, receiverCardNumber, currency } = req.body;
      if (amount <= 0)
        throw new BadRequestException({
          message: 'Amount сannot be 0 or less',
        });
      const transaction = await this.CardService.sendMoneyByCardsId(
        id,
        amount,
        senderCardId,
        receiverCardNumber,
        currency,
      );
      if (!transaction) throw new BadRequestException(transaction);
      this.CardService.confirmSendTransaction(transaction);

      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get(':id/transactions')
  async getTransactions(
    @Param('id', ParseIntPipe) cardId: number,
    @Req() req,
    @Res() res,
  ) {
    try {
      const transactions = await this.CardService.getCardTransactions(cardId);

      return res.status(200).json({ transactions: [...transactions] });
    } catch (err) {
      return handleError(res, err);
    }
  }
}
