import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminAuthModule } from './modules/auth.module';
import { AdminUserModule } from './modules/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    AdminAuthModule,
    AdminUserModule,
  ],
})
export class AdminModule {}
