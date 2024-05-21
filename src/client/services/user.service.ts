import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../common/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { CardService } from 'src/client/services/card.service';
import { configHash } from 'src/common/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly cardService: CardService,
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
    const userProfile = await this.usersRepository.findOne({ where: { id } });
    const cardList = await this.cardService.getCardsByCardId(userProfile.cardList);
    const totalBalance = await this.getBalance(id);
    const errors = await validate(id).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException({ errors: errors });
    return { ...userProfile, cardList: cardList, balance: totalBalance };
  }

  async getBalance(id) {
    const user = await this.usersRepository.findOne({ where: { id } });
    const cards = await this.cardService.getCardsByCardId(user.cardList);
    const totalBalance = cards.reduce(
      (totalBalance, card) => totalBalance + card.balance,
      0,
    );
    return totalBalance;
  }
}
