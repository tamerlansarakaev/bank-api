import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../common/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import * as bcryptjs from 'bcryptjs';
import { validate } from 'class-validator';
import { ClientCardService } from 'src/client/services/card.service';
import { configHash } from 'src/common/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { cacheHelper } from 'src/common/utils/cache';
import { Card } from 'src/common/entities/card.entity';

export interface IProfile extends Omit<User, 'cardList' | 'password'> {
  cardList: Card[];
  balance: number;
}

@Injectable()
export class ClientUserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly cardService: ClientCardService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const { name, email, password, surname } = userData;
    const hashPassword = await bcryptjs.hash(password, configHash.hashSalt);

    const user = new User();
    Object.assign(user, { email, name, password: hashPassword, surname });
    user.cardList = [];

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestException({
        errors: errors.map((error) => error.constraints),
      });
    }

    return await this.usersRepository.save(user);
  }

  async getProfile(id: number): Promise<IProfile> {
    let userProfile = await this.cacheManager.get<User>(
      cacheHelper.userKey(id),
    );

    if (!userProfile) {
      userProfile = await this.usersRepository.findOne({ where: { id } });

      if (!userProfile) {
        throw new BadRequestException('User not found');
      }

      await this.cacheManager.set(cacheHelper.userKey(id), userProfile);
    }

    const { password, ...profile } = userProfile;

    const cardList = await this.cardService.getCardsByCardId(
      userProfile.cardList,
    );
    const totalBalance = await this.getBalance(cardList);

    return { ...profile, cardList, balance: totalBalance };
  }

  async getBalance(cardList: Card[]): Promise<number> {
    if (!cardList) return 0;
    return cardList.reduce(
      (totalBalance, card) => totalBalance + card.balance,
      0,
    );
  }

  async getUser(userId: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
