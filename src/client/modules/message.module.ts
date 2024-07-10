import { Module } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/common/entities/message.entity';
import { Chat } from 'src/common/entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message,Chat])],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}