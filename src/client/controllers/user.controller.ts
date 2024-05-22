import { Controller, Res, Req, Get } from '@nestjs/common';
import { ClientUserService } from '../services/user.service';

@Controller('client/users')
export class ClientUserController {
  constructor(private userService: ClientUserService) {}

  @Get('profile')
  async getProfile(@Req() req, @Res() res) {
    try {
      const { id } = req.user;
      const getProfile = await this.userService.getProfile(id);
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
