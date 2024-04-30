import { IsInt, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Card {
    @PrimaryGeneratedColumn()
    id: number

    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: "Full Name must have atleast 5 characters" })
    fullName: string;

    @IsInt()
    @IsNotEmpty()
    @MinLength(8, { message: "Full Name must have atleast 8 characters" })
    @Column({ unique: true })
    @PrimaryGeneratedColumn()
    cardNumber: number
}