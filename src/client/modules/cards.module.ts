import { Module, forwardRef } from '@nestjs/common';
import { CardsController } from '../controllers/cards.controller';
import { CardsService } from '../services/cards.service';
import { Card } from '../../common/entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/client/modules/users.module';
import { User } from 'src/common/entities/user.entity';
import { Transaction } from 'src/common/entities/transaction.entity';
import { TransactionsModule } from './transactions.module';

@Module({
  imports: [
    TransactionsModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Card, User, Transaction]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
