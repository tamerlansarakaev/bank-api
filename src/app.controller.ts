import { Controller, Get, Res } from '@nestjs/common';
import { Card } from './common/entities/card.entity';
import { ApiExcludeEndpoint, ApiExtraModels } from '@nestjs/swagger';
import { User } from './common/entities/user.entity';
import { Admin } from './admin/entities/admin.entity';
import { Transaction } from './common/entities/transaction.entity';
import { AppService } from './app.service';
import { Response } from 'express';
import { handleError } from './common/utils/handles/handleError';
import { Public } from './common/decorators/public.decorator';

@Controller()
@ApiExtraModels(Card, User, Admin, Transaction)
export class AppController {
  constructor(private appService: AppService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Public()
  async index(@Res() res: Response) {
    try {
      const defaultPage = this.appService.defaultPage();
      return res
        .status(200)
        .setHeader('Content-Type', 'text/html')
        .send(defaultPage);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
