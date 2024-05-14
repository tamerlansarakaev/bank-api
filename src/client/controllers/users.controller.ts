import { Controller, Res, Req, Get } from '@nestjs/common';
import { UserService } from '../services/users.service';

@Controller('client/users')
export class UserController {
  constructor(private UserService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req, @Res() res) {
    try {
      const { id } = req.user;
      const getProfile = await this.UserService.getProfile(id);
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
