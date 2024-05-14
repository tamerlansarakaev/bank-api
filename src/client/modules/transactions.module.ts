import { Module } from '@nestjs/common';
import { TransactionsController } from '../controllers/transactions.controller';
import { TransactionsService } from '../services/transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/common/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
