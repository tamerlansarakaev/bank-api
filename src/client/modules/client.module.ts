import { Module, UseGuards } from '@nestjs/common';
import { ClientUserModule } from './user.module';
import { ClientCardModule } from './card.module';
import { AuthModule } from './auth.module';
import { CleintTransactionModule } from './transaction.module';
import { APP_GUARD } from '@nestjs/core';
import { ClientGuard } from 'src/common/guards/client.guard';

@Module({
  imports: [ClientUserModule, ClientCardModule, AuthModule, CleintTransactionModule],
  providers: [{ provide: APP_GUARD, useClass: ClientGuard }],
})
export class ClientModule {}
