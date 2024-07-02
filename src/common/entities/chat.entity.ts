import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMessage } from '../interfaces/ChatMessage';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  userId: number;

  @Column()
  @ApiProperty()
  room: string;

  @Column({ type: 'jsonb' })
  @ApiProperty()
  messageList: Array<ChatMessage>;
}
