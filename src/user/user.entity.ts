import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @Column({ unique: true })
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @MinLength(3, { message: 'Name must have atleast 3 characters' })
    @IsAlphanumeric(null, { message: 'Name does not allow other than alpha numeric chars.' })
    name: string;

    @IsString()
    @MinLength(3, { message: 'Name must have atleast 3 characters' })
    @IsAlphanumeric(null, { message: 'Name does not allow other than alpha numeric chars.' })
    surname: string;

    @Column({ unique: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(5, { message: "Password must have atleast 5 characters" })
    password: string;
    
}