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
  FINISHED = 'Finished',
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
  @IsInt()
  cardId: number;

  @Column()
  @IsNotEmpty()
  status: TransactionStatuses;

  @Column()
  statusMessage: string;

  @Column()
  type: TransactionTypes;

  @Column()
  @IsDate()
  date: Date;
}
