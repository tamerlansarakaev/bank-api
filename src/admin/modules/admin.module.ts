import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../entities/admin.entity';
import { AdminAuthModule } from './auth.module';
import { AdminUserModule } from './user.module';
import { AdminCardModule } from './card.module';
import { AdminTransactionModule } from './transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    AdminAuthModule,
    AdminUserModule,
    AdminCardModule,
    AdminTransactionModule,
  ],
})
export class AdminModule {}
