import { Module } from '@nestjs/common';
import { AdminTransactionController } from '../controllers/transaction.controller';
import { AdminTransactionService } from '../services/transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/common/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [AdminTransactionController],
  providers: [AdminTransactionService],
})
export class AdminTransactionModule {}
