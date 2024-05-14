import { Module, forwardRef } from '@nestjs/common';
import { CardsController } from '../controllers/cards.controller';
import { CardsService } from '../services/cards.service';
import { Card } from '../../common/entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/client/modules/users.module';
import { User } from 'src/common/entities/user.entity';

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
