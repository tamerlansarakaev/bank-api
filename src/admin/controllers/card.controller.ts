import { Controller, Get, Res } from '@nestjs/common';
import { AdminCardService } from '../services/card.service';
import { Response } from 'express';
import { handleError } from 'src/common/handles/handleError';

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
}
