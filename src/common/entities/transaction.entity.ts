import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency } from './card.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionTypes {
  SEND = 'Send',
  DEPOSIT = 'Deposit',
}

export enum TransactionStatuses {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  DENIED = 'Denied',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @IsInt()
  @ApiProperty()
  amount: number;

  @Column()
  @IsNotEmpty()
  @ApiProperty()
  currency: Currency;

  @Column({ default: null })
  @ApiPropertyOptional()
  senderCardNumber: string | null;

  @Column()
  @ApiProperty()
  receiverCardNumber: string;

  @Column({
    type: 'enum',
    enum: TransactionStatuses,
    default: TransactionStatuses.PENDING,
  })
  @ApiProperty()
  @IsNotEmpty()
  status: TransactionStatuses;

  @Column({ default: '' })
  @ApiPropertyOptional()
  statusMessage?: string;

  @Column()
  @ApiProperty()
  type: TransactionTypes;

  @Column({ default: new Date() })
  @IsDate()
  @UpdateDateColumn()
  @ApiProperty()
  date: Date;
}
