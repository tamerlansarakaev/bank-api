import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() userData: CreateUserDto, @Res() res) {
    try {
      const createdUser = await this.usersService.createUser(userData);
      return res.status(200).json({ createdUser });
    } catch (error) {
      console.log(error);
      if (!error.status || !error.message) {
        return res.status(500).json({ message: error.detail });
      }
      return res.status(error.status).json({ message: error.response.errors });
    }
  }

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
