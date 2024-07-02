import { ChatSession } from '@google/generative-ai';
import { SocketRoles } from '../socket/chat.gateway';

export interface IRoomMessage {
  session: ChatSession;
  room?: string;
  userId?: number;
  id: string;
  message: string;
  role?: SocketRoles;
  token: string;
}
