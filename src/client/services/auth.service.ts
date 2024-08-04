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
    private readonly userService: ClientUserService,
    private readonly jwtService: JwtService,
  ) {}

  async getTokens(id: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ id, email }, { secret: jwtConstants.secret }),
      this.jwtService.signAsync(
        { id, email },
        { secret: jwtConstants.refreshToken, expiresIn: '7d' },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async signIn({
    email,
    pass,
  }: {
    email: string;
    pass: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    if (!pass) {
      throw new BadRequestException({ message: `The Password field can't be empty` });
    }

    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException({
          message: `User with Email: ${email} not found`,
        });
      }

      const isPasswordValid = await bcryptjs.compare(pass, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Password is incorrect');
      }

      return await this.getTokens(user.id, email);
    } catch (error) {
      throw error;
    }
  }

  async signUp(userData: CreateUserDto): Promise<SignUpDto> {
    try {
      const existingUser = await this.userService.getUserByEmail(userData.email);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const newUser = await this.userService.createUser(userData);
      const tokens = await this.getTokens(newUser.id, userData.email);

      return { ...newUser, ...tokens };
    } catch (error) {
      throw error;
    }
  }
}
