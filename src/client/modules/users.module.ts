import { Module } from '@nestjs/common';
import { UserController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../common/entities/user.entity';
import { CardsModule } from 'src/client/modules/cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CardsModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
