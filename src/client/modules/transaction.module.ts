import { Module } from '@nestjs/common';
import { ClientTransactionController } from '../controllers/transaction.controller';
import { ClientTransactionService } from '../services/transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/common/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [ClientTransactionController],
  providers: [ClientTransactionService],
  exports: [ClientTransactionService],
})
export class CleintTransactionModule {}
