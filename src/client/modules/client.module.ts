import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { CardsModule } from './cards.module';
import { AuthModule } from './auth.module';
import { TransactionsModule } from './transactions.module';

@Module({
  imports: [UsersModule, CardsModule, AuthModule, TransactionsModule],
})
export class ClientModule {}
