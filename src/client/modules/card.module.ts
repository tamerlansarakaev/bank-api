import { Module, forwardRef } from '@nestjs/common';
import { CardController } from '../controllers/card.controller';
import { CardService } from '../services/card.service';
import { Card } from '../../common/entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/client/modules/user.module';
import { User } from 'src/common/entities/user.entity';
import { Transaction } from 'src/common/entities/transaction.entity';
import { TransactionModule } from './transaction.module';

@Module({
  imports: [
    TransactionModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Card, User, Transaction]),
  ],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
