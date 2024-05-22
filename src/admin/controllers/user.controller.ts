import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { AdminUserService } from '../services/user.service';
import { Response } from 'express';
import { handleError } from 'src/common/handles/handleError';

@Controller('admin/users')
export class AdminUserController {
  constructor(private userService: AdminUserService) {}
  @Get()
  async getAllUsers(@Res() res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      if (!users) throw new NotFoundException({ message: 'Users not found' });

      return res.status(200).json(users);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json(error.response.errors || { message: error.message });
    }
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.getUserById(userId);
      return res.status(200).json(user);
    } catch (error) {
      return handleError(res, error);
    }
  }
}
