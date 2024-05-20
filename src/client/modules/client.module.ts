import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { CardsModule } from './cards.module';
import { AuthModule } from './auth.module';
import { TransactionsModule } from './transactions.module';
import { APP_GUARD } from '@nestjs/core';
import { ClientGuard } from 'src/common/guards/client.guard';

@Module({
  imports: [UsersModule, CardsModule, AuthModule, TransactionsModule],
  providers: [{ provide: APP_GUARD, useClass: ClientGuard }],
})
export class ClientModule {}
