import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { AdminCardService } from '../services/card.service';
import { Response } from 'express';
import { handleError } from 'src/common/utils/handles/handleError';

@Controller('admin/cards')
export class AdminCardController {
  constructor(private cardService: AdminCardService) {}

  @Get()
  async getAllCards(@Res() res: Response) {
    console.log(1)
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
}
