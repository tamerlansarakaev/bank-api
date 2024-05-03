import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
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
    user.name = name;
    user.email = email;
    user.password = password;
    user.surname = surname;
    const errors = await validate(user).then(errors => errors.map(error => error.constraints))
    if (errors.length) throw new BadRequestException({ errors: errors })

    return await this.usersRepository.save(user);
  }
}
