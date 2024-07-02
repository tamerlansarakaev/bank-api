import { Module } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from 'src/common/socket/chat.gateway';
import { ClientUserModule } from './user.module';

@Module({
  providers: [ChatService, ChatGateway],
  imports: [ClientUserModule],
})
export class ChatModule {}
