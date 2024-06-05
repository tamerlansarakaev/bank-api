import { Controller, Res, Req, Get } from '@nestjs/common';
import { ClientUserService } from '../services/user.service';
import { handleError } from 'src/common/utils/handles/handleError';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileDto } from 'src/common/dto/profile.dto';

@ApiBearerAuth()
@ApiTags('Client')
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiBearerAuth()
@Controller('client/user')
export class ClientUserController {
  constructor(private userService: ClientUserService) {}

  @Get('profile')
  @ApiResponse({ status: 200, description: 'Return profile', type: ProfileDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Req() req, @Res() res) {
    try {
      const { id } = req.user;
      const profile = await this.userService.getProfile(id);
      return res.status(200).json(profile);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
