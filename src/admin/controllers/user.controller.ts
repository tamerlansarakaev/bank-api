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
import { handleError } from 'src/common/utils/handles/handleError';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin/users')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class AdminUserController {
  constructor(private userService: AdminUserService) {}
  @Get()
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 404, description: 'Users not found' })
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
  @ApiResponse({ status: 200, description: 'Return user by id' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
