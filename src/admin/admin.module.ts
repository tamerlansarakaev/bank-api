import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminAuthModule } from './modules/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), AdminAuthModule],
})
export class AdminModule {}
