import { SocketRoles } from "../entities/message.entity";

export interface ChatMessage {
  chatId: number;
  senderName: string;
  message: string;
  role: SocketRoles;
  sentDate: Date;
}
