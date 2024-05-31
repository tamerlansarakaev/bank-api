import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Res,
} from '@nestjs/common';
import { AdminCardService } from '../services/card.service';
import { Response } from 'express';
import { handleError } from 'src/common/utils/handles/handleError';

@Controller('admin/cards')
export class AdminCardController {
  constructor(private cardService: AdminCardService) {}

  @Get()
  async getAllCards(@Res() res: Response) {
    try {
      const cards = await this.cardService.getAllCards();
      return res.status(200).json(cards);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Get(':id')
  async getCardById(
    @Param('id', ParseIntPipe) cardId: number,
    @Res() res: Response,
  ) {
    try {
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Put(':id/block')
  async blockCardById(
    @Body() { statusMessage },
    @Param('id', ParseIntPipe) cardId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.cardService.blockCard(cardId, statusMessage);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
