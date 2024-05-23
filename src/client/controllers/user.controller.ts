import { Controller, Res, Req, Get } from '@nestjs/common';
import { ClientUserService } from '../services/user.service';
import { handleError } from 'src/common/utils/handles/handleError';

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
      return handleError(res, error);
    }
  }
}
