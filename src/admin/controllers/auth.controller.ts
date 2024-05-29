import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AdminAuthService } from '../services/auth.service';
import { SignUpAdminDto } from '../dto/sign-up-admin.dto';
import { handleError } from 'src/common/utils/handles/handleError';
import { SignInAdminDto } from '../dto/sign-in-admin.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../entities/admin.entity';

@Controller('admin/auth')
@UseGuards(RolesGuard)
export class AdminAuthController {
  constructor(private authService: AdminAuthService) {}

  @Post('register')
  @Roles(Role.Owner)
  async signUp(@Body() signUpData: SignUpAdminDto, @Res() res) {
    try {
      const tokens = await this.authService.signUp(signUpData);
      return res.status(200).json(tokens);
    } catch (error) {
      return handleError(res, error);
    }
  }
  @Post('login')
  @Public()
  async signIn(@Body() signInData: SignInAdminDto, @Res() res: Response) {
    try {
      const tokens = await this.authService.signIn(signInData);
      return res.status(200).json(tokens);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
