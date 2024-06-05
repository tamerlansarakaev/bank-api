import { Module, forwardRef } from '@nestjs/common';
import { ClientTransactionController } from '../controllers/transaction.controller';
import { ClientTransactionService } from '../services/transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/common/entities/transaction.entity';
import { ClientCardModule } from './card.module';
import { ClientUserModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    forwardRef(() => ClientUserModule),
  ],
  controllers: [ClientTransactionController],
  providers: [ClientTransactionService],
  exports: [ClientTransactionService],
})
export class ClientTransactionModule {}
