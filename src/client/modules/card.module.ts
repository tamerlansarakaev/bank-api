import { Module, forwardRef } from '@nestjs/common';
import { ClientCardController } from '../controllers/card.controller';
import { ClientCardService } from '../services/card.service';
import { Card } from '../../common/entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientUserModule } from 'src/client/modules/user.module';
import { User } from 'src/common/entities/user.entity';
import { Transaction } from 'src/common/entities/transaction.entity';
import { ClientTransactionModule } from './transaction.module';

@Module({
  imports: [
    forwardRef(() => ClientTransactionModule),
    forwardRef(() => ClientUserModule),
    TypeOrmModule.forFeature([Card, User, Transaction]),
  ],
  controllers: [ClientCardController],
  providers: [ClientCardService],
  exports: [ClientCardService],
})
export class ClientCardModule {}
