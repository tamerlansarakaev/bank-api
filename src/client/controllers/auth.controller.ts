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
import { SignInDto } from '../../common/dto/auth/signIn.dto';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { handleError } from 'src/common/utils/handles/handleError';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from 'src/common/dto/auth/signUp.dto';
import { AuthTokens } from 'src/common/dto/auth/auth-tokens.dto';

@ApiTags('Client')
@Controller('client/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: AuthTokens,
  })
  @ApiResponse({ status: 404, description: 'User by email not found' })
  async signIn(@Body() signData: SignInDto, @Res() res) {
    try {
      const result = await this.authService.signIn({
        email: signData.email,
        pass: signData.password,
      });
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }

  @Public()
  @Post('register')
  @ApiResponse({ status: 201, description: 'User created', type: SignUpDto })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async signUp(@Body() signUpData: CreateUserDto, @Res() res) {
    try {
      const createdUser = await this.authService.signUp(signUpData);
      if (!createdUser) throw new BadRequestException();
      return res.status(201).json({ user: createdUser });
    } catch (error) {
      if (!error.status || !error.message) {
        return res.status(500).json({ message: error });
      }
      return handleError(res, error);
    }
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return Updated tokens' })
  @ApiResponse({ status: 401, description: 'Refresh token invalid' })
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
