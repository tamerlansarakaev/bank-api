import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from 'src/common/entities/chat.entity';
import { Message, SocketRoles } from 'src/common/entities/message.entity';
import { validateEntityData } from 'src/common/utils/errorValidate';

export interface ISendMessage {
  senderId: number;
  message: string;
  chatId: number;
  role?: SocketRoles;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async createMessage(data: ISendMessage): Promise<Message> {
    const chat = await this.chatRepository.findOne({
      where: { id: data.chatId },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${data.chatId} not found`);
    }

    const newMessage = this.messageRepository.create(data);
    await validateEntityData(newMessage);

    const savedMessage = await this.messageRepository.save(newMessage);

    chat.messages.push(savedMessage.id);
    await this.chatRepository.save(chat);

    return savedMessage;
  }

  async getAllMessagesByMessagesId(
    chatId: number,
    messagesId: number[],
  ): Promise<Message[]> {
    if (!messagesId || messagesId.length === 0) {
      return [];
    }

    const messages = await this.messageRepository.find({
      where: { chatId },
    });

    if (!messages || messages.length === 0) {
      return [];
    }

    return messages.filter(
      (message) => message && message.id && messagesId.includes(message.id),
    );
  }

  async getAllMessageByUserId(userId: number): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { senderId: userId },
    });

    if (!messages || messages.length === 0) {
      throw new NotFoundException(`Messages for user with id ${userId} not found`);
    }

    return messages;
  }
}