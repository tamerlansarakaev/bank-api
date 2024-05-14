import { Controller, Res, Req, Get } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('client/users')
export class UserController {
  constructor(private UsersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req, @Res() res) {
    try {
      const { id } = req.user;
      const getProfile = await this.UsersService.getProfile(id);
      return res.status(200).json({ userProfile: getProfile });
    } catch (error) {
      console.log(error);
      if (!error.status || !error.message) {
        return res.status(500).json({ message: error.detail });
      }
      return res.status(error.status).json({ message: error.response.errors });
    }
  }
}
