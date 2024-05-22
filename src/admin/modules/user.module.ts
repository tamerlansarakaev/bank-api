import { Module } from '@nestjs/common';
import { AdminUserController } from '../controllers/user.controller';
import { AdminUserService } from '../services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminUserController],
  providers: [AdminUserService],
})
export class AdminUserModule {}
