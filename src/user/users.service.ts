import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) { }

    async getUserByEmail(email: string) {
        try {
            return await this.usersRepository.findOne({ where: { email } })
        } catch (error) {
            return null
        }
    }
}
