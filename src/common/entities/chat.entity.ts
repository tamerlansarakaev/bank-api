import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  creatorId: number;

  @Column({ type: 'jsonb', default: [] })
  @ApiProperty()
  messages: number[];

  @CreateDateColumn()
  createdAt: Date;
}
