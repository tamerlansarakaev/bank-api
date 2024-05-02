import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async signIn(email: string, pass: string): Promise<{ access_token: string, refreshToken: string }> {
        const user = await this.usersService.getUserByEmail(email)

        if (user.password !== pass) {
            throw new UnauthorizedException()
        }

        const payload = { id: user.id, email }

        return {
            access_token: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            refreshToken: await this.jwtService.signAsync(payload, {expiresIn: '7d'})
        }
    }
}
