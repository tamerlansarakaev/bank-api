import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<Array<User>> {
    const users = await this.userRepository.find();
    return users;
  }

  async getUserById(id) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException({ message: 'User not found' });
    return user;
  }
}
