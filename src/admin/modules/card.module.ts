import { Module } from '@nestjs/common';
import { AdminCardController } from '../controllers/card.controller';
import { AdminCardService } from '../services/card.service';

@Module({
  controllers: [AdminCardController],
  providers: [AdminCardService],
})
export class AdminCardModule {}
