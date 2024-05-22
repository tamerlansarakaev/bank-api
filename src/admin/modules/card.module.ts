import { Module } from '@nestjs/common';
import { AdminCardController } from '../controllers/card.controller';
import { AdminCardService } from '../services/card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from 'src/common/entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  controllers: [AdminCardController],
  providers: [AdminCardService],
})
export class AdminCardModule {}
