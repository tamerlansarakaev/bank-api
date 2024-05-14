import { Module } from '@nestjs/common';
import { UserController } from '../controllers/users.controller';
import { UserService } from '../services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../common/entities/user.entity';
import { CardsModule } from 'src/client/modules/cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CardsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
