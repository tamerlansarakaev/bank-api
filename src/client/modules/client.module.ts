import { Module, forwardRef } from '@nestjs/common';
import { ClientUserModule } from './user.module';
import { ClientCardModule } from './card.module';
import { ClientAuthModule } from './auth.module';
import { ClientTransactionModule } from './transaction.module';
import { APP_GUARD } from '@nestjs/core';
import { ClientGuard } from 'src/common/guards/client.guard';
import { ChatModule } from './chat.module';

@Module({
  imports: [
    ClientUserModule,
    ClientCardModule,
    ClientAuthModule,
    forwardRef(() => ChatModule),
    ClientTransactionModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ClientGuard }],
})
export class ClientModule {}
