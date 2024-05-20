import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column()
  senderCardNumber: string;

  @Column()
  receiverCardNumber: string;

  @Column({ default: TransactionStatuses.PENDING })
  @IsNotEmpty()
  status: TransactionStatuses;

  @Column({ default: null })
  statusMessage: string | null;

  @Column()
  type: TransactionTypes;

  @Column({ default: new Date() })
  @IsDate()
  date: Date;
}
