import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getProfile(@Param('id', ParseIntPipe) id: number, @Res() res) {
    try {
      const getProfile = await this.usersService.getProfile(id);
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
