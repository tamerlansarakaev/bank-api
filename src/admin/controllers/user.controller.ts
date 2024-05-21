import { Controller, Get } from '@nestjs/common';
import { AdminUserService } from '../services/user.service';

@Controller('admin/users')
export class AdminUserController {
  constructor(private userService: AdminUserService) {}
  @Get()
  async getAllUsers() {
    this.userService;
  }
}
