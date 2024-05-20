import { validate } from 'class-validator';
import { SignUpAdminDto } from '../dto/sign-up-admin.dto';
import { Admin } from '../entities/admin.entity';
import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class AdminAuthService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
  ) {}

  async validateAdminByUsername(username: string) {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (!admin) return false;
    return true;
  }

  async signUp(signUpData: SignUpAdminDto) {
    const admin = new Admin();
    Object.assign(admin, signUpData);
    const validationErrors = await validate(admin).then((errors) =>
      errors.map((error) => error.constraints),
    );

    const validateUsername = await this.validateAdminByUsername(
      signUpData.username,
    );

    if (!validateUsername)
      throw new BadRequestException({
        message: `Admin with ${signUpData.username} already exists`,
      });

    if (validationErrors.length)
      throw new BadRequestException(validationErrors);
  }
}
