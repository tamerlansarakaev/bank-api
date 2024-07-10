import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SocketRoles {
  CLIENT = 'Client',
  AI_ASSISTANT = 'AI Assistant',
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  message: string;

  @Column({ nullable: true })
  senderId: number;

  @Column({ default: SocketRoles.CLIENT })
  role: SocketRoles;

  @Column()
  chatId: number;

  @CreateDateColumn()
  createdAt: Date;
}
