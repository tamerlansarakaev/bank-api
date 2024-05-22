import { Controller, Get, NotFoundException, Res } from '@nestjs/common';
import { AdminUserService } from '../services/user.service';
import { Response } from 'express';

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
}
