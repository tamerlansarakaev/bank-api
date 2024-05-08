import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { SignUpDto } from './dto/signUp.dto';
import { jwtConstants } from 'src/constants';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async signIn(email: string, pass: string): Promise<{ access_token: string, refreshToken: string }> {
        try {
            const user = await this.usersService.getUserByEmail(email)
            const comparePassword = await bcrypt.compare(pass, user.password)
            if (!user) throw new NotFoundException()

            if (!comparePassword) {
                throw new UnauthorizedException('Password is incorrect')
            }

            const payload = { id: user.id, email }
            const payloadRefreshToken = { id: user.id, email }
            return {
                access_token: await this.jwtService.signAsync(payload),
                refreshToken: await this.jwtService.signAsync(payloadRefreshToken, { expiresIn: '7d', secret: jwtConstants.refreshToken })
            }
        } catch (error) {
            throw error
        }
    }

    async signUp(userData: CreateUserDto): Promise<SignUpDto> | undefined {
        try {
            const findUser = await this.usersService.getUserByEmail(userData.email)
            if (findUser) throw new BadRequestException('User already exists')
            const user = await this.usersService.createUser(userData)
            const payload = { id: user.id, email: user.email }
            const accessToken = await this.jwtService.signAsync(payload)
            const refreshToken = await this.jwtService.signAsync(payload, {
                expiresIn: '7d', secret: jwtConstants.refreshToken
            })
            return { ...user, access_token: accessToken, refresh_token: refreshToken }
        } catch (error) {
            throw error
        }
    }
}
