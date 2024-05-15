import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card, Currency } from './card.entity';

export enum TransactionTypes {
  SEND = 'Send',
  DEPOSIT = 'Deposit',
}

export enum TransactionStatuses {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  FINISHED = 'Finished',
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
  senderCardId: number;

  @Column()
  receiverCardId: number;

  @Column({ default: TransactionStatuses.PENDING })
  @IsNotEmpty()
  status: TransactionStatuses;

  @Column()
  statusMessage: string;

  @Column()
  type: TransactionTypes;

  @Column({ default: new Date() })
  @IsDate()
  date: Date;
}
