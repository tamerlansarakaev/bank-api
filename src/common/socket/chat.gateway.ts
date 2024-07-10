import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IRoomMessage } from '../interfaces/roomMessage';
import { ChatService } from 'src/client/services/chat.service';
import { UseGuards } from '@nestjs/common';
import { CustomSocket, WsAuthGuard } from '../guards/ws.guard';
import { Message, SocketRoles } from '../entities/message.entity';
import { validateEntityData } from '../utils/errorValidate';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const authToken = client.handshake.auth.token;
      const decoded = await this.chatService.validateJWT(authToken);

      if (!authToken || !decoded) {
        throw new WsException('Missing token');
      }
      client['userId'] = decoded.id;
    } catch (err) {
      client.emit('error', new WsException(err));
      client.disconnect();
    }
  }

  @SubscribeMessage('create-chat')
  async createChat(@ConnectedSocket() client: CustomSocket) {
    try {
      const userId = client.userId;
      const createdChat = await this.chatService.createChat(userId);
      await this.handleJoinRoom(client, { chatId: createdChat.id });
    } catch (error) {
      client.emit('error', new WsException(error));
    }
  }

  @SubscribeMessage('join')
  async handleJoinRoom(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() { chatId }: { chatId: number },
  ) {
    try {
      if (!chatId) {
        return client.emit(
          'error',
          'chatId field is important for join to chat',
        );
      }

      const userId = client.userId;
      await this.chatService.validateChat(userId, chatId);
      const chat = await this.chatService.getChatById(chatId, userId);
      client.join(String(chatId));

      const messages = await this.chatService.getChatMessages({
        chatId,
        messagesId: chat.messages,
      });

      client.emit('joined', {
        chatId,
        createdAt: chat.createdAt,
        userId,
        messages,
      });
    } catch (error) {
      client.emit('error', new WsException(error.message));
    }
  }

  @SubscribeMessage('roomMessage')
  async handleRoomMessage(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: IRoomMessage,
  ) {
    try {
      const userId = client.userId;
      const chatId = Number(data.room);
      const chat = await this.chatService.getChatById(chatId, userId);

      if (!chat) return;

      await this.chatService.validateChat(userId, chatId);
      client.join(data.room);

      if (!client.rooms.has(data.room)) {
        throw new WsException(
          `You don't have access to send messages to chat: ${data.room}`,
        );
      }

      const userMessageData = {
        message: data.message,
        userId: data.userId,
        room: data.room,
        role: SocketRoles.CLIENT,
      };

      const userMessage = new Message();
      Object.assign(userMessage, {
        chatId,
        senderId: userMessageData.userId,
        message: userMessageData.message,
      });

      this.server.to(data.room).emit('roomMessage', userMessageData);

      const validateUserMessage = await validateEntityData(userMessage);
      if (validateUserMessage) {
        throw new WsException({ validateUserMessage });
      }

      const aiMessage = await this.chatService.handleSendMessage({
        userId,
        message: data.message,
        chatId: data.room,
      });

      this.server.to(data.room).emit('aiMessage', {
        role: SocketRoles.AI_ASSISTANT,
        message: aiMessage,
        room: data.room,
      });
    } catch (error) {
      client.emit('error', new WsException(error));
    }
  }

  @SubscribeMessage('delete')
  async handleLeaveRoom(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() { room }: { room: string },
  ) {
    try {
      const userId = client.userId;
      await this.chatService.deleteChat(userId, Number(room));
      client.leave(room);
    } catch (error) {
      client.emit('error', new WsException(error));
    }
  }
}
