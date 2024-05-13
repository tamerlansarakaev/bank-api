import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: 'The Name field is important field' })
  @IsString()
  @MinLength(3, { message: 'Name must have at least 3 characters' })
  name: string;

  @Column()
  @IsNotEmpty({ message: 'The Surname field is important' })
  @IsString()
  @MinLength(3, { message: 'Surname must have at least 3 characters' })
  surname: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'The Email field is important field' })
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty({ message: 'The Password field is important field' })
  @IsString()
  @MinLength(5, { message: 'Password must have at least 5 characters' })
  password: string;

  @Column({ type: 'jsonb' })
  cardList: number[];
}
