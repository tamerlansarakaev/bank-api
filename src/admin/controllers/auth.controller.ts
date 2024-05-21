import { Controller, Post } from '@nestjs/common';

@Controller('admin/auth')
export class AdminAuthController {
  @Post('login')
  async signIn() {}
}
