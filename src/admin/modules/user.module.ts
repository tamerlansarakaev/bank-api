import { Module } from '@nestjs/common';
import { AdminUserController } from '../controllers/user.controller';
import { AdminUserService } from '../services/user.service';

@Module({
  controllers: [AdminUserController],
  providers: [AdminUserService],
})
export class AdminUserModule {}
