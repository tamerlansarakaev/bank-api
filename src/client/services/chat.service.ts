import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ClientUserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/common/constants';
import chatManager from 'src/common/ai/chat.manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/common/entities/chat.entity';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { MessageService } from './message.service';
import { SocketRoles } from 'src/common/entities/message.entity';

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

  async getUserProfile(userId) {
    if (!userId) throw new Error('UserId is important');
    const user = await this.userService.getProfile(userId);
    const password = user.password.replace(/./g, '*');
    if (!user) throw new NotFoundException(`User with id: ${userId} not found`);
    return { password, ...user };
  }

  async validateJWT(token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });

    if (payload) {
      return payload;
    } else {
      return false;
    }
  }
  А;

  async connect(userId: number) {
    try {
      const user = await this.userService.getProfile(userId);
      if (!user) return;

      await chatManager.getOrCreateSession(user);
      return user.id;
    } catch (error) {
      return error;
    }
  }

  async getChatMessages({ chatId, messagesId }) {
    try {
      const messages = await this.messageService.getAllMessagesByMessagesId(
        chatId,
        messagesId,
      );
      return messages;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async handleSendMessage({ message, userId, chatId }): Promise<string> {
    try {
      const user = await this.userService.getProfile(userId);
      if (!user) return;
      const session = await chatManager.getOrCreateSession(user);
      const result: string = await session.sendMessage(message);
      if (result) {
        this.messageService
          .createMessage({
            chatId,
            message,
            senderId: userId,
          })
          .then(() => {
            this.messageService.createMessage({
              chatId,
              message: result,
              senderId: null,
              role: SocketRoles.AI_ASSISTANT,
            });
          });
      }
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAllChats(userId: number) {
    const chatList = await this.chatRepository.find({
      where: { creatorId: userId },
    });
    if (!chatList)
      throw new Error(`User with id:${userId} doens't have chat chats`);

    return chatList;
  }

  async createChat(userId: number): Promise<Chat> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const chat = new Chat();
    chat.creatorId = userId;
    const createdChat = await this.chatRepository.save(chat);
    user.chatList.push(createdChat.id);
    await this.userRepository.save(user);

    return createdChat;
  }

  async validateChat(userId: number, chatId: number) {
    const chat = await this.chatRepository.find({
      where: { id: chatId, creatorId: userId },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return true;
  }

  async deleteChat(userId: number, chatId: number) {
    const validate = await this.validateChat(userId, chatId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!validate) throw new Error('You not own this chat');
    if (!user) throw new Error('User not found');

    const deletedChat = await this.chatRepository.delete(chatId);
    const updatedChatList = user.chatList.filter((id) => {
      return id !== chatId;
    });
    await this.userRepository.save({ ...user, chatList: updatedChatList });
    return deletedChat;
  }

  async getChatById(chatId: number, userId: number) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, creatorId: userId },
    });

    if (chat) {
      return chat;
    } else {
      throw new Error('Chat not found');
    }
  }
}
