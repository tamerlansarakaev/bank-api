import { BadRequestException, Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    async signIn(@Body() signData: SignInDto, @Res() res) {
        try {
            const result = await this.authService.signIn(signData.email, signData.password)
            return res.status(200).json(result)

        } catch (error) {
            if (!error.status || !error.message) {
                return res.status(500).json({ message: error });
            }
            return res.status(error.status).json({ message: error.response.message });
        }
    }

    @Public()
    @Post('register')
    async signUp(@Body() signUpData: CreateUserDto, @Res() res) {
        try {
            const createdUser = await this.authService.signUp(signUpData)
            if (!createdUser) throw new BadRequestException()
            return res.status(200).json({ user: createdUser })
        } catch (error) {
            if (!error.status || !error.message) {
                return res.status(500).json({ message: error });
            }
            return res.status(error.status).json({ message: error.response.message });
        }
    }

    @Get('refresh')
    async refreshToken() {

    }
}
