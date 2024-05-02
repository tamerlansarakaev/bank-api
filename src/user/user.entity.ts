import { IsAlphanumeric, IsEmail,  IsString, MinLength } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    @MinLength(3, { message: 'Name must have at least 3 characters' })
    @IsAlphanumeric(null, { message: 'Name does not allow other than alphanumeric characters.' })
    name: string;

    @Column()
    @IsString()
    @MinLength(3, { message: 'Surname must have at least 3 characters' })
    @IsAlphanumeric(null, { message: 'Surname does not allow other than alphanumeric characters.' })
    surname: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    @IsString()
    @MinLength(5, { message: "Password must have at least 5 characters" })
    password: string;

    @Column({ type: 'jsonb', nullable: true })
    cardList: number[];
}
