import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { User } from 'src/common/entities/user.entity';
import { reddisHelper } from 'src/common/utils/reddis';
import { Repository } from 'typeorm';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAllUsers(): Promise<Array<User>> {
    const users = await this.userRepository.find();
    return users;
  }

  async getUserById(id) {
    const cacheUser = await this.cacheManager.get(reddisHelper.userKey(id));
    if (cacheUser) return cacheUser;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException({ message: 'User not found' });
    await this.cacheManager.set(reddisHelper.userKey(id), user);
    return user;
  }
}
