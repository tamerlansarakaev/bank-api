import { SocketRoles } from "../socket/chat.gateway";

export interface ChatMessage {
  chatId: number;
  senderName: string;
  message: string;
  role: SocketRoles;
  sentDate: Date;
}
