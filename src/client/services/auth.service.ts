import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/client/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../../common/dto/signUp.dto';
import { jwtConstants } from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private UsersService: UsersService,
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
      const user = await this.UsersService.getUserByEmail(email);
      if (!user)
        throw new NotFoundException({
          message: `User with Email: ${email} not found`,
        });

      const comparePassword = await bcrypt.compare(pass, user.password);
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
      const findUser = await this.UsersService.getUserByEmail(userData.email);
      if (findUser) throw new BadRequestException('User already exists');
      const user = await this.UsersService.createUser(userData);
      const tokens = await this.getTokens(user.id, userData.email);
      return { ...user, ...tokens };
    } catch (error) {
      throw error;
    }
  }
}
