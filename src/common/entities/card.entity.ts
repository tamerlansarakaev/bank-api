import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString, MinLength } from 'class-validator';
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
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must have at least 3 characters' })
  name: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Surname must have at least 3 characters' })
  surname: string;

  @Column({ unique: true })
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(16, { message: 'Card Number must have at least 16 digits' })
  cardNumber: string;

  @Column()
  @ApiProperty()
  @IsDate()
  expirationDate: Date;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cvv: string;

  @Column()
  @ApiProperty()
  userId: number;

  @Column({ default: 0 })
  @ApiProperty()
  balance: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  @ApiProperty()
  currency: Currency;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.ACTIVE })
  @ApiPropertyOptional()
  status?: CardStatus;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  statusMessage?: string | null;

  @Column({ type: 'jsonb', default: [] })
  @ApiPropertyOptional()
  transactions?: Array<number>;
}
