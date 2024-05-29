import { Module } from '@nestjs/common';
import { AdminAuthController } from '../controllers/auth.controller';
import { AdminAuthService } from '../services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}
