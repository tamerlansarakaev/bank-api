import {
  BadRequestException,
  Body,
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
import { handleError } from 'src/common/utils/handles/handleError';
import { Currency } from 'src/common/entities/card.entity';

@Controller('client/cards')
export class ClientCardController {
  constructor(
    @Inject(forwardRef(() => ClientUserService))
    private userService: ClientUserService,

    @InjectRepository(User) private userRepository: Repository<User>,
    private cardService: ClientCardService,
  ) {}

  @Post()
  async addCard(@Req() req, @Res() res: Response) {
    try {
      const { email } = req.user;
      if (!email) throw new BadRequestException();
      const user = await this.userService.getUserByEmail(email);
      if (!user) throw new NotFoundException('User Not Found');
      const createdCard = await this.cardService.addCard(
        user.id,
        user.name,
        user.surname,
      );
      user.cardList.push(createdCard.id);
      await this.userRepository.save({ ...user });

      return res.status(201).json(createdCard);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Get()
  async getCards(@Req() req, @Res() res: Response) {
    try {
      const { email } = req.user;
      const profile = await this.userService.getUserByEmail(email);
      const cards = await this.cardService.getCardsByCardId(profile.cardList);

      return res.status(200).json({ cards: [...cards] });
    } catch (error) {
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
      const card = await this.cardService.getCard(cardId, userId);
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

      if (!receiverCardNumber)
        throw new BadRequestException({
          message: 'Receiver card number is important field',
        });
      if (amount <= 0)
        throw new BadRequestException({
          message: 'Amount сannot be 0 or less',
        });
      const transaction = await this.cardService.sendMoneyByCardsId(
        id,
        amount,
        senderCardId,
        receiverCardNumber,
        currency,
      );
      if (!transaction) throw new BadRequestException(transaction);
      this.cardService.confirmSendTransaction(transaction);

      return res.status(202).json(transaction);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get(':id/transactions')
  async getTransactions(@Param('id', ParseIntPipe) cardId: number, @Res() res) {
    try {
      const transactions = await this.cardService.getCardTransactions(cardId);
      return res.status(200).json({ transactions: [...transactions] });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  @Post('deposit')
  async deposit(
    @Body() { cardNumber, amount, currency },
    @Req() req,
    @Res() res,
  ) {
    try {
      const { id } = req.user;
      const depositResponse = await this.cardService.depositByCardNumber(
        id,
        cardNumber,
        amount,
        currency,
      );
      return res.status(202).json(depositResponse);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
