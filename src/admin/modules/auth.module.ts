import { Module } from '@nestjs/common';
import { AdminAuthController } from '../controllers/auth.controller';

@Module({
  controllers: [AdminAuthController],
})
export class AdminAuthModule {}
