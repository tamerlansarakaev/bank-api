import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  Admin = 'admin',
  Owner = 'owner',
}

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  @IsString()
  @ApiProperty()
  email: string;

  @Column({ unique: true })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @Column()
  @IsString()
  @ApiProperty()
  password: string;

  @Column({ enum: Role, enumName: 'roles', type: 'jsonb', default: [] })
  @ApiProperty()
  roles: Array<Role>;
}
