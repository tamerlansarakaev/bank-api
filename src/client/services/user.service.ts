import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../common/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { ClientCardService } from 'src/client/services/card.service';
import { configHash } from 'src/common/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { reddisHelper } from 'src/common/utils/reddis';
import { Card } from 'src/common/entities/card.entity';

@Injectable()
export class ClientUserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly cardService: ClientCardService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
    const hashPassword = await bcrypt.hash(password, configHash.hashSalt);
    const userObject: CreateUserDto = {
      email,
      name,
      password: hashPassword,
      surname,
    };

    Object.assign(user, userObject);
    user.cardList = [];
    const errors = await validate(user).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException({ errors: errors });

    return await this.usersRepository.save(user);
  }

  async getProfile(id) {
    const cacheUser: User = await this.cacheManager.get(
      reddisHelper.userKey(id),
    );

    if (cacheUser) {
      const cardList = await this.cardService.getCardsByCardId(
        cacheUser.cardList,
      );
      const totalBalance = await this.getBalance(cardList);
      const errors = await validate(id).then((errors) =>
        errors.map((error) => error.constraints),
      );
      if (errors.length) throw new BadRequestException({ errors: errors });
      return { ...cacheUser, cardList: cardList, balance: totalBalance };
    }

    const userProfile = await this.usersRepository.findOne({ where: { id } });
    await this.cacheManager.set(
      reddisHelper.userKey(userProfile.id),
      userProfile,
    );

    const cardList = await this.cardService.getCardsByCardId(
      userProfile.cardList,
    );
    const totalBalance = await this.getBalance(cardList);
    const errors = await validate(id).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException({ errors: errors });
    return { ...userProfile, cardList: cardList, balance: totalBalance };
  }

  async getBalance(cardList: Card[]) {
    const totalBalance = cardList.reduce(
      (totalBalance, card) => totalBalance + card.balance,
      0,
    );
    return totalBalance;
  }
}
