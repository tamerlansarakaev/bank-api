import { IsDate, IsInt, IsNotEmpty, IsString, Length, MinLength } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum cardStatus {
    ACTIVE = 'Active',
    BLOCKED = 'Blocked'
}

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: "Full Name must have at least 5 characters" })
    fullName: string;

    @Column({ unique: true })
    @IsInt()
    @IsNotEmpty()
    @MinLength(8, { message: "Card Number must have at least 8 digits" })
    @PrimaryGeneratedColumn()
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
    @IsInt()
    currency: number;

    @Column()
    status: cardStatus.ACTIVE | cardStatus.BLOCKED

    @Column()
    statusMessage: string | null;

    @Column({ type: 'jsonb', nullable: true })
    transactions: Array<number> | null

}