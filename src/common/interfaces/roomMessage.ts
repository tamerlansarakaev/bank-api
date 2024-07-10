import { SocketRoles } from '../entities/message.entity';

export interface IRoomMessage {
  room?: string;
  userId?: number;
  message: string;
  role?: SocketRoles;
}
