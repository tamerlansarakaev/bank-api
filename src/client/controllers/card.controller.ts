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
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'src/common/entities/transaction.entity';
import { Card } from 'src/common/entities/card.entity';
import { SendMoneyDto } from 'src/common/dto/card/send-money.dto';

@ApiTags('Client')
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiBearerAuth()
@Controller('client/cards')
export class ClientCardController {
  constructor(
    @Inject(forwardRef(() => ClientUserService))
    private userService: ClientUserService,

    @InjectRepository(User) private userRepository: Repository<User>,
    private cardService: ClientCardService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Card created', type: Card })
  async addCard(@Req() req, @Res() res: Response) {
    try {
      const { email } = req.user;
      if (!email) throw new BadRequestException();
      const user = await this.userService.getUserByEmail(email);
      if (!user) throw new NotFoundException('User Not Found');
      const createdCard = await this.cardService.addCard({
        name: user.name,
        userId: user.id,
        surname: user.surname,
      });
      user.cardList.push(createdCard.id);
      await this.userRepository.save({ ...user });

      return res.status(201).json(createdCard);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return cards', type: [Card] })
  @ApiResponse({ status: 404, description: 'Cards not found' })
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
  @ApiResponse({ status: 200, description: 'Return card', type: Card })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async getCard(
    @Req() req,
    @Res() res: Response,
    @Param('id', ParseIntPipe) cardId: number,
  ) {
    try {
      const { id } = req.user;
      const card = await this.cardService.getCard({ id: cardId, userId: id });

      return res.status(200).json(card);
    } catch (err) {
      return handleError(res, err);
    }
  }

  @Post(':cardId/send')
  @ApiResponse({ status: 202, description: 'Money sent', type: Transaction })
  @ApiBody({ type: SendMoneyDto })
  @ApiResponse({ status: 404, description: 'Card not found' })
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
      const transaction = await this.cardService.sendMoney({
        userId: id,
        amount,
        senderCardId,
        receiverCardNumber,
        currency,
      });
      if (!transaction) throw new BadRequestException(transaction);
      this.cardService.confirmSendTransaction(transaction);

      return res.status(202).json(transaction);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Get(':id/transactions')
  @ApiResponse({
    status: 200,
    description: 'Return transactions',
    type: [Transaction],
  })
  @ApiResponse({ status: 404, description: 'Transactions not found' })
  async getTransactions(
    @Param('id', ParseIntPipe) cardId: number,
    @Res() res: Response,
  ) {
    try {
      const transactions = await this.cardService.getCardTransactions(cardId);
      return res.status(200).json({ transactions: [...transactions] });
    } catch (err) {
      return handleError(res, err);
    }
  }

  @Post(':id/deposit')
  @ApiResponse({
    status: 202,
    description: 'Transaction for deposit created',
    type: Transaction,
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async deposit(
    @Body() { amount, currency },
    @Param('id', ParseIntPipe) cardId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const { id } = req.user;
      const depositResponse = await this.cardService.deposit({
        userId: id,
        cardId,
        amount,
        currency,
      });
      return res.status(202).json(depositResponse);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
