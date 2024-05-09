import { Module, forwardRef } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card } from './card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/user/users.module';
import { User } from 'src/user/user.entity';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Card]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
