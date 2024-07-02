import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IRoomMessage } from '../interfaces/WebSocket';
import { ChatService } from 'src/client/services/chat.service';

export enum SocketRoles {
  CLIENT = 'Client',
  AI_ASSISTANT = 'AI Assistant',
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { token },
  ) {
    const chatSession = await this.chatService.connect(token);
    if (!chatSession || !chatSession.userId) {
      return client.emit('error', `Something happened wrong`);
    }
    const room = String(new Date().getTime());
    client.join(room);
    client.emit('joined', {
      message: 'Successful connected',
      role: SocketRoles.AI_ASSISTANT,
      room,
      userId: chatSession.userId,
      session: chatSession.session,
    });
  }

  @SubscribeMessage('roomMessage')
  async handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: IRoomMessage,
  ) {
    if (!data.session || !data.message.length || !data.userId) {
      return client.emit('error', {
        message: 'One of important field is empty',
        receiverData: {
          message: data.message,
          userId: data.userId,
        },
      });
    }

    this.server.to(data.room).emit('roomMessage', {
      id: client.id,
      message: data.message,
      userId: data.userId,
      room: data.room,
      role: SocketRoles.CLIENT,
    });

    const aiMessage = await this.chatService.handleSendMessage(
      data.token,
      data.message,
    );
    this.server.to(data.room).emit('aiMessage', {
      role: SocketRoles.AI_ASSISTANT,
      message: aiMessage,
      room: data.room,
      id: client.id,
    });
    return;
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room) {
    client.leave(room);
  }
}
