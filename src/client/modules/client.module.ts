import { Module } from '@nestjs/common';
import { ClientUserModule } from './user.module';
import { ClientCardModule } from './card.module';
import { AuthModule } from './auth.module';
import { ClientTransactionModule } from './transaction.module';

@Module({
  imports: [
    ClientUserModule,
    ClientCardModule,
    AuthModule,
    ClientTransactionModule,
  ],
  providers: [],
})
export class ClientModule {}
