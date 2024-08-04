import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ClientUserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { errorMessages, jwtConstants } from 'src/common/constants';
import chatManager from 'src/common/ai/chat.manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/common/entities/chat.entity';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { MessageService } from './message.service';
import { SocketRoles } from 'src/common/entities/message.entity';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => ClientUserService))
    private userService: ClientUserService,
    private messageService: MessageService,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getUserProfile(userId: number) {
    if (!userId) throw new Error('UserId is required');
    const user = await this.userService.getProfile(userId);
    if (!user) throw new NotFoundException(`User with id: ${userId} not found`);
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, password: '*'.repeat(password.length) };
  }

  async validateJWT(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      return payload;
    } catch (error) {
      return false;
    }
  }

  async getChatMessages({
    chatId,
    messagesId,
  }: {
    chatId: number;
    messagesId: number[];
  }) {
    try {
      return await this.messageService.getAllMessagesByMessagesId(
        chatId,
        messagesId,
      );
    } catch (error) {
      throw new Error(`Failed to get chat messages: ${error.message}`);
    }
  }

  async handleSendMessage({
    message,
    userId,
    chatId,
  }: {
    message: string;
    userId: number;
    chatId: number;
  }): Promise<string> {
    try {
      const user = await this.userService.getProfile(userId);
      if (!user)
        throw new NotFoundException(`User with id: ${userId} not found`);

      const session = await chatManager.getOrCreateSession(user);
      const result: string = await session.sendMessage(message);

      await this.messageService.createMessage({
        chatId,
        message,
        senderId: userId,
      });

      if (typeof result === 'string') {
        await this.messageService.createMessage({
          chatId,
          message: result,
          senderId: userId,
          role: SocketRoles.AI_ASSISTANT,
        });
      } else {
        await this.messageService.createMessage({
          chatId,
          message: `I can't answer your question`,
          senderId: null,
          role: SocketRoles.AI_ASSISTANT,
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async getAllChats(userId: number): Promise<Chat[]> {
    const chatList = await this.chatRepository.find({
      where: { creatorId: userId },
    });
    if (!chatList.length) {
      throw new NotFoundException(
        `User with id:${userId} doesn't have any chats`,
      );
    }
    return chatList;
  }

  async createChat(userId: number): Promise<Chat> {
    try {
      const user = await this.userService.getUser(userId);
      const chat = this.chatRepository.create({ creatorId: userId });
      const createdChat = await this.chatRepository.save(chat);

      user.chatList = user.chatList || [];
      user.chatList.push(createdChat.id);
      await this.userRepository.save(user);

      return createdChat;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async validateChat(userId: number, chatId: number): Promise<boolean> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, creatorId: userId },
    });
    return !!chat;
  }

  async deleteChat(userId: number, chatId: number) {
    const isValid = await this.validateChat(userId, chatId);
    if (!isValid) throw new NotFoundException('You do not own this chat');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.chatRepository.delete(chatId);

    user.chatList = user.chatList.filter((id) => id !== chatId);
    await this.userRepository.save(user);

    return { success: true, message: 'Chat deleted successfully' };
  }

  async getChatById(chatId: number, userId: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, creatorId: userId },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    return chat;
  }
}
