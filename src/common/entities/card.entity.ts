import {
  IsDate,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CardStatus {
  ACTIVE = 'Active',
  BLOCKED = 'Blocked',
}

export enum Currency {
  USD = 'USD',
  EURO = 'EURO',
}

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must have at least 3 characters' })
  name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Surname must have at least 3 characters' })
  surname: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @MinLength(16, { message: 'Card Number must have at least 16 digits' })
  cardNumber: string;

  @Column()
  @IsDate()
  expirationDate: Date;

  @Column()
  @IsNotEmpty()
  @IsString()
  cvv: string;

  @Column()
  userId: number;

  @Column({ default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  currency: Currency;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.ACTIVE })
  status?: CardStatus;

  @Column({ nullable: true })
  statusMessage?: string | null;

  @Column({ type: 'jsonb', default: [] })
  transactions?: Array<number>;
}
