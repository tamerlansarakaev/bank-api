import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { CardModule } from './card.module';
import { AuthModule } from './auth.module';
import { TransactionModule } from './transaction.module';
import { APP_GUARD } from '@nestjs/core';
import { ClientGuard } from 'src/common/guards/client.guard';

@Module({
  imports: [UserModule, CardModule, AuthModule, TransactionModule],
  providers: [{ provide: APP_GUARD, useClass: ClientGuard }],
})
export class ClientModule {}
