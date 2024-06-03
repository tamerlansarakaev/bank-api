import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Res,
} from '@nestjs/common';
import { AdminCardService } from '../services/card.service';
import { Response } from 'express';
import { handleError } from 'src/common/utils/handles/handleError';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Card } from 'src/common/entities/card.entity';

@Controller('admin/cards')
@ApiTags('Admin')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class AdminCardController {
  constructor(private cardService: AdminCardService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Return all cards', type: [Card] })
  async getAllCards(@Res() res: Response) {
    try {
      const cards = await this.cardService.getAllCards();
      return res.status(200).json(cards);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Return card by id', type: Card })
  async getCardById(
    @Param('id', ParseIntPipe) cardId: number,
    @Res() res: Response,
  ) {
    try {
      const card = await this.cardService.getCardById(cardId);
      return res.status(200).json(card);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Patch(':id/block')
  @ApiBody({
    description: 'Block Data',
    required: false,
    schema: {
      example: {
        statusMessage: 'Your card blocked because you not using it',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successful response' })
  async blockCardById(
    @Body() { statusMessage },
    @Param('id', ParseIntPipe) cardId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.cardService.blockCard(cardId, statusMessage);
      return res
        .status(200)
        .json({ message: `Card with Id: ${result.id} is blocked` });
    } catch (error) {
      return handleError(res, error);
    }
  }
}
