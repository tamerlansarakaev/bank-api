import { validate } from 'class-validator';
import { SignUpAdminDto } from '../dto/sign-up-admin.dto';
import { Admin, Role } from '../entities/admin.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignInAdminDto } from '../dto/sign-in-admin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminDto } from '../dto/admin.dto';
import { configHash, jwtConstants } from 'src/common/constants';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  private async getTokens(data: AdminDto) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: data.id,
          roles: data.roles,
        },
        { secret: jwtConstants.adminToken },
      ),
      this.jwtService.signAsync(
        {
          id: data.id,
          roles: data.roles,
        },
        { secret: jwtConstants.adminRefreshToken },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async validateAdminByUsername(username: string) {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (!admin) return false;
    return true;
  }

  async signUp(signUpData: SignUpAdminDto) {
    const admin = new Admin();
    const hashedPassword = await bcrypt.hash(
      signUpData.password,
      configHash.hashSalt,
    );
    admin.roles = [];

    admin.roles.push(Role.Admin);
    Object.assign(admin, signUpData);
    admin.password = hashedPassword;
    const validationErrors = await validate(admin).then((errors) =>
      errors.map((error) => error.constraints),
    );

    const validateUsername = await this.validateAdminByUsername(
      signUpData.username,
    );

    if (validateUsername)
      throw new BadRequestException({
        message: `Admin with username:${signUpData.username} already exists`,
      });

    if (validationErrors.length)
      throw new BadRequestException(validationErrors);
    const createdAdmin = await this.adminRepository.save(admin);

    return await this.getTokens({
      id: createdAdmin.id,
      roles: createdAdmin.roles,
    });
  }

  async signIn({ username, password }: SignInAdminDto) {
    if (!username || !password)
      throw new BadRequestException({
        message: 'username and password fields is important',
      });
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (!admin)
      throw new NotFoundException({
        message: `Account with username: ${username} not found`,
      });
    const comparePassword = await bcrypt.compare(password, admin.password);
    if (!comparePassword)
      throw new UnauthorizedException({ message: 'Wrong password' });

    return await this.getTokens({ id: admin.id, roles: admin.roles });
  }
}
