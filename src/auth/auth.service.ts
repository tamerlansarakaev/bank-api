import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signUp.dto';
import { jwtConstants } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getTokens(id, email) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync({ id, email }, { secret: jwtConstants.secret }),
      this.jwtService.signAsync(
        { id, email },
        { secret: jwtConstants.refreshToken, expiresIn: '7d' },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const user = await this.usersService.getUserByEmail(email);
      const comparePassword = await bcrypt.compare(pass, user.password);
      if (!user) throw new NotFoundException();

      if (!comparePassword) {
        throw new UnauthorizedException('Password is incorrect');
      }

      return await this.getTokens(user.id, email);
    } catch (error) {
      throw error;
    }
  }

  async signUp(userData: CreateUserDto): Promise<SignUpDto> | undefined {
    try {
      const findUser = await this.usersService.getUserByEmail(userData.email);
      if (findUser) throw new BadRequestException('User already exists');
      const user = await this.usersService.createUser(userData);
      const tokens = await this.getTokens(user.id, userData.email);
      return { ...user, ...tokens };
    } catch (error) {
      throw error;
    }
  }
}
