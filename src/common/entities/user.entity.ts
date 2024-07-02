import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @IsNotEmpty({ message: 'The Name field is important field' })
  @IsString()
  @MinLength(3, { message: 'Name must have at least 3 characters' })
  @ApiProperty()
  name: string;

  @Column()
  @IsNotEmpty({ message: 'The Surname field is important' })
  @IsString()
  @MinLength(3, { message: 'Surname must have at least 3 characters' })
  @ApiProperty()
  surname: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'The Email field is important field' })
  @IsEmail()
  @ApiProperty()
  email: string;

  @Column()
  @IsNotEmpty({ message: 'The Password field is important field' })
  @IsString()
  @MinLength(5, { message: 'Password must have at least 5 characters' })
  @ApiProperty()
  password: string;

  @Column({ type: 'jsonb' })
  @ApiProperty()
  cardList: number[];

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty()
  chatList: number[];
}
