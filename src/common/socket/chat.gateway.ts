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
      await this.handleGetChats(client);
    } catch (error) {
      client.emit('error', new WsException(error));
    }
  }

  @SubscribeMessage('join')
  async handleJoinRoom(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() { chatId },
  ) {
    try {
      const userId = client.userId;
      await this.chatService.validateChat(userId, chatId);
      const chat = await this.chatService.getChatById(chatId, userId);
      if (!chatId) {
        return client.emit(
          'error',
          'chatId field is important for join to chat',
        );
      }
      await this.chatService.connect(userId);
      client.join(chatId);

      const messages = await this.chatService.getChatMessages({
        chatId,
        messagesId: chat.messages,
      });

      return client.emit('joined', {
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
      const chat = await this.chatService.getChatById(
        Number(data.room),
        userId,
      );
      if (!chat) return;

      const validate = await this.chatService.validateChat(
        userId,
        Number(data.room),
      );
      if (validate) {
        client.join(data.room);
      }
      const validateAccess = client.rooms.has(data.room);
      if (!validateAccess)
        throw new WsException(
          `You doesn't have access to send message to chat: ${data.room}`,
        );

      const userMessageData = {
        message: data.message,
        userId: data.userId,
        room: data.room,
        role: SocketRoles.CLIENT,
      };

      const updatedUserMessageData = {
        chatId: Number(userMessageData.room),
        senderId: userMessageData.userId,
        message: userMessageData.message,
      };

      const userMessage = new Message();

      Object.assign(userMessage, { ...updatedUserMessageData });
      this.server.to(data.room).emit('roomMessage', userMessageData);
      const validateUserMessage = await validateEntityData(userMessage);

      if (validateUserMessage) {
        throw new WsException({ validateUserMessage });
      }

      const aiMessage = await this.chatService
        .handleSendMessage({
          userId,
          message: data.message,
          chatId: data.room,
        })
        .catch((err) => {
          throw new WsException(err);
        });
      this.server.to(data.room).emit('aiMessage', {
        role: SocketRoles.AI_ASSISTANT,
        message: aiMessage,
        room: data.room,
      });
      return;
    } catch (error) {
      client.emit('error', new WsException(error));
    }
  }

  @SubscribeMessage('delete')
  async handleLeaveRoom(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() room,
  ) {
    try {
      const userId = client.userId;
      await this.chatService.deleteChat(userId, room);
      client.leave(room);
      await this.handleGetChats(client);
    } catch (error) {
      client.emit('error', new WsException(error));
    }
  }

  @SubscribeMessage('all-chats')
  async handleGetChats(@ConnectedSocket() client: CustomSocket) {
    const userId = client.userId;
    if (!userId) throw new WsException(`Unauthorized`);
    const chatList = await this.chatService.getAllChats(userId);
    client.emit('all-chats', chatList);
  }
}
