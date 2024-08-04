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
import { Inject, UseGuards, Logger } from '@nestjs/common';
import { CustomSocket, WsAuthGuard } from '../guards/ws.guard';
import { Message, SocketRoles } from '../entities/message.entity';
import { validateEntityData } from '../utils/errorValidate';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { cacheHelper } from '../utils/cache';
import { IChat } from '../interfaces/chat';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private chatService: ChatService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const authToken = client.handshake.auth.token;
      const decoded = await this.chatService.validateJWT(authToken);

      if (!authToken || !decoded) {
        throw new WsException('Missing or invalid token');
      }
      client['userId'] = decoded.id;
    } catch (err) {
      this.logger.error(`Connection error: ${err.message}`);
      client.emit('error', new WsException(err.message));
      client.disconnect();
    }
  }

  @SubscribeMessage('create-chat')
  async createChat(@ConnectedSocket() client: CustomSocket) {
    try {
      const userId = client.userId;
      const createdChat = await this.chatService.createChat(Number(userId));
      await this.handleJoinRoom(client, {
        chatId: createdChat.id,
        cache: false,
      });
    } catch (error) {
      this.logger.error(`Create chat error: ${error.message}`);
      client.emit('error', new WsException(error.message));
    }
  }

  @SubscribeMessage('join')
  async handleJoinRoom(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody()
    { chatId, cache = false }: { chatId: number; cache?: boolean },
  ) {
    try {
      if (!chatId) {
        throw new WsException('chatId field is required to join a chat');
      }

      const userId = client.userId;
      const isValid = await this.chatService.validateChat(userId, chatId);
      if (!isValid) {
        throw new WsException('You do not have access to this chat');
      }

      const cacheKey = cacheHelper.chatKey(chatId);
      const cachedChat: IChat = await this.cacheManager.get(cacheKey);

      if (cachedChat && cache) {
        return client.emit('joined', {
          chatId,
          createdAt: cachedChat.createdAt,
          userId,
          messages: cachedChat.messages,
        });
      }

      const chat = await this.chatService.getChatById(chatId, userId);
      const messages = await this.chatService.getChatMessages({
        chatId,
        messagesId: chat.messages,
      });

      const cacheData = { ...chat, messages };
      await this.cacheManager.set(cacheKey, cacheData);

      client.join(chatId.toString());
      return client.emit('joined', {
        chatId,
        createdAt: chat.createdAt,
        userId,
        messages,
      });
    } catch (error) {
      this.logger.error(`Join room error: ${error.message}`);
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

      const isValid = await this.chatService.validateChat(userId, chatId);
      if (!isValid) {
        throw new WsException('You do not have access to this chat');
      }
      client.join(chatId.toString());

      const userMessageData = {
        message: data.message,
        userId: userId,
        room: data.room,
        role: SocketRoles.CLIENT,
      };

      const userMessage = new Message();
      Object.assign(userMessage, {
        chatId,
        senderId: userId,
        message: data.message,
      });

      const validateUserMessage = await validateEntityData(userMessage);
      if (validateUserMessage) {
        throw new WsException(validateUserMessage);
      }

      this.server.to(data.room).emit('roomMessage', userMessageData);

      const aiMessage = await this.chatService.handleSendMessage({
        userId,
        message: data.message,
        chatId: chatId,
      });

      this.server.to(data.room).emit('aiMessage', {
        role: SocketRoles.AI_ASSISTANT,
        message:
          typeof aiMessage === 'string'
            ? aiMessage
            : "I can't answer your question",
        room: data.room,
      });

      await this.cacheManager.del(cacheHelper.chatKey(chatId));
    } catch (error) {
      this.logger.error(`Room message error: ${error.message}`);
      client.emit('error', new WsException(error.message));
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
      client.emit('chatDeleted', { room });
    } catch (error) {
      this.logger.error(`Delete chat error: ${error.message}`);
      client.emit('error', new WsException(error.message));
    }
  }
}
