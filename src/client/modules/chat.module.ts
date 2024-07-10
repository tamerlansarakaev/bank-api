import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from 'src/common/socket/chat.gateway';
import { ClientUserModule } from './user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/common/entities/chat.entity';
import { User } from 'src/common/entities/user.entity';
import { MessageModule } from './message.module';
import { ChatController } from '../controllers/chat.controller';
import { Message } from 'src/common/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User]),
    forwardRef(() => ClientUserModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
