import { Module } from '@nestjs/common';
import { ClientUserController } from '../controllers/user.controller';
import { ClientUserService } from '../services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../common/entities/user.entity';
import { ClientCardModule } from 'src/client/modules/card.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ClientCardModule],
  controllers: [ClientUserController],
  providers: [ClientUserService],
  exports: [ClientUserService],
})
export class ClientUserModule {}
