import { Module, forwardRef } from '@nestjs/common';
import { CardsController } from '../controllers/cards.controller';
import { CardsService } from '../services/cards.service';
import { Card } from '../../common/entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/client/modules/users.module';
import { User } from 'src/common/entities/user.entity';
import { TransactionsModule } from './transactions.module';

@Module({
  imports: [
    TransactionsModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Card]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
