import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientUserService } from 'src/client/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import * as bcryptjs from 'bcryptjs';
import { SignUpDto } from '../../common/dto/auth/signUp.dto';
import { jwtConstants } from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: ClientUserService,
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

  async signIn({
    email,
    pass,
  }): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user)
        throw new NotFoundException({
          message: `User with Email: ${email} not found`,
        });

      const comparePassword = await bcryptjs.compare(pass, user.password);
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
      const findUser = await this.userService.getUserByEmail(userData.email);
      if (findUser) throw new BadRequestException('User already exists');
      const user = await this.userService.createUser(userData);
      const tokens = await this.getTokens(user.id, userData.email);
      return { ...user, ...tokens };
    } catch (error) {
      throw error;
    }
  }
}
