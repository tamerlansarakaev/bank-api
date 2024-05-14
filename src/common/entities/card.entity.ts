import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum cardStatus {
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
  @MinLength(5, { message: 'Name must have at least 5 characters' })
  name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Surname must have at least 5 characters' })
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
  @IsInt()
  cvv: number;

  @Column()
  userId: number;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: Currency.USD })
  currency: Currency;

  @Column({ default: cardStatus.ACTIVE })
  status?: cardStatus.ACTIVE | cardStatus.BLOCKED;

  @Column({ default: '' })
  statusMessage?: string | null;

  @Column({ type: 'jsonb', default: [] })
  transactions?: Array<number>;
}
