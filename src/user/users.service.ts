import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { CardsService } from 'src/card/cards.service';
import { configHash } from 'src/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly cardService: CardsService,
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
    user.name = name;
    user.email = email;
    user.password = hashPassword;
    user.surname = surname;
    user.cardList = [];
    const errors = await validate(user).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException({ errors: errors });
    return await this.usersRepository.save(user);
  }

  async getProfile(id) {
    const userProfile = await this.usersRepository.findOne({ where: { id } });
    const cardList = await this.cardService.getCardsUser(userProfile.cardList);
    const errors = await validate(userProfile).then((errors) =>
      errors.map((error) => error.constraints),
    );
    if (errors.length) throw new BadRequestException({ errors: errors });
    return { ...userProfile, cardList: cardList, balance: 5000 };
  }

  async getBalance(id) {
    const user = await this.usersRepository.findOne({ where: { id } });
    const cardList = await this.cardService.getCardsUser(user.cardList);
  }
}
