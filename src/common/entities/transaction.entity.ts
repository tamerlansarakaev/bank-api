import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency } from './card.entity';

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
  id: number;

  @Column()
  @IsInt()
  amount: number;

  @Column()
  @IsNotEmpty()
  currency: Currency;

  @Column({ default: null })
  senderCardNumber: string | null;

  @Column()
  receiverCardNumber: string;

  @Column({
    type: 'enum',
    enum: TransactionStatuses,
    default: TransactionStatuses.PENDING,
  })
  @IsNotEmpty()
  status: TransactionStatuses;

  @Column({ default: null })
  statusMessage: string | null;

  @Column()
  type: TransactionTypes;

  @Column({ default: new Date() })
  @IsDate()
  @UpdateDateColumn()
  date: Date;
}
