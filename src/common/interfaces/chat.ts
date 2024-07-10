import { Message } from '../entities/message.entity';

export interface IChat {
  chatId: number;
  createdAt: Date;
  userId: number | null;
  messages: Message[];
}
