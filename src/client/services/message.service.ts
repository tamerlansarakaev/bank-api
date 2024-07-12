import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/common/entities/chat.entity';
import { Message, SocketRoles } from 'src/common/entities/message.entity';
import { validateEntityData } from 'src/common/utils/errorValidate';
import { Repository } from 'typeorm';

export interface ISendMessage {
  senderId: number;
  message: string;
  chatId: number;
  role?: SocketRoles;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}

  async createMessage({ ...data }: ISendMessage) {
    const newMessage = new Message();
    const chat = await this.chatRepository.findOne({
      where: { id: data.chatId },
    });

    Object.assign(newMessage, data);
    await validateEntityData(newMessage);

    const message = await this.messageRepository.save(newMessage);
    chat.messages.push(message.id);
    await this.chatRepository.save(chat);

    return message;
  }

  async getAllMessagesByMessagesId(
    chatId: number,
    messagesId: Array<number>,
  ): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { chatId },
    });

    const filteredMessages = [];

    if (!messagesId) return [];
    for (const message of messages) {
      if (message) {
        const validate = messagesId.includes(message.id);
        if (validate) {
          filteredMessages.push(message);
        }
      }
    }

    if (!messages.length) return [];

    return filteredMessages;
  }

  async getAllMessageByUserId(userId: number) {
    const messages = await this.messageRepository.find({
      where: { senderId: userId },
    });

    if (!messages.length) throw new Error('Messages not found');

    return messages;
  }
}
