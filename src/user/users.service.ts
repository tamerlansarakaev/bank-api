import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) { }

  async getUserByEmail(email: string) {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: CreateUserDto) {
    const { name, email, password, surname } = userData;
    const user = new User();

    const hashPassword = await bcrypt.hash(password, 15);
    user.name = name;
    user.email = email;
    user.password = hashPassword;
    user.surname = surname;
    const errors = await validate(user).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException({ errors: errors });

    return await this.usersRepository.save(user);
  }

  async getProfile(id) {
    const userProfile = await this.usersRepository.findOne({ where: { id } });
    console.log(userProfile);
    const errors = await validate(id).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException({ errors: errors });
    return userProfile;
  }
}
