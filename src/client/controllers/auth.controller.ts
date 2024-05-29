import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SignInDto } from '../../common/dto/signIn.dto';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { handleError } from 'src/common/utils/handles/handleError';

@Controller('client/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async signIn(@Body() signData: SignInDto, @Res() res) {
    try {
      const result = await this.authService.signIn(
        signData.email,
        signData.password,
      );
      return res.status(200).json(result);
    } catch (error) {
      if (!error.status || !error.message) {
        return res.status(500).json({ message: error });
      }
      return handleError(res, error);
    }
  }

  @Public()
  @Post('register')
  async signUp(@Body() signUpData: CreateUserDto, @Res() res) {
    try {
      const createdUser = await this.authService.signUp(signUpData);
      if (!createdUser) throw new BadRequestException();
      return res.status(200).json({ user: createdUser });
    } catch (error) {
      if (!error.status || !error.message) {
        return res.status(500).json({ message: error });
      }
      return handleError(res, error);
    }
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshToken(@Req() req, @Res() res) {
    try {
      if (!req.user) throw new UnauthorizedException();
      const { email, id } = req.user;

      return res.status(200).json(await this.authService.getTokens(id, email));
    } catch (error) {
      return handleError(res, error);
    }
  }
}
