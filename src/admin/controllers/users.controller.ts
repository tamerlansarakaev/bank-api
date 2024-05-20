import { Controller, Get } from '@nestjs/common';

@Controller('admin/users')
export class AdminUsersController {
    @Get()
    async getAllUsers() {
        
    }
}
