import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum cardStatus {
  ACTIVE = 'Active',
  BLOCKED = 'Blocked',
}

export enum currency {
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
  @IsInt()
  @IsNotEmpty()
  @MinLength(8, { message: 'Card Number must have at least 8 digits' })
  cardNumber: number;

  @Column()
  @IsDate()
  expirationDate: Date;

  @Column()
  @IsNotEmpty()
  @Length(3, 3)
  cvv: number;

  @Column()
  userId: number;

  @Column()
  balance: number;

  @Column()
  currency: string;

  @Column()
  status?: cardStatus.ACTIVE | cardStatus.BLOCKED;

  @Column()
  statusMessage?: string | null;

  @Column({ type: 'jsonb'})
  transactions?: Array<number> | null;
}
