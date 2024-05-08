import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from 'src/decorators/public.decorator';
import { RefreshTokenGuard } from 'src/guards/refresh-token.guard';

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

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    async refreshToken(@Req() req, @Res() res) {
        try {
            if (!req.user) throw new UnauthorizedException()
            const { email, id } = req.user

            return res.status(200).json(await this.authService.getTokens(id, email))
        } catch (error) {
            return res.status(error.status).json({ message: error.response.message });
        }
    }
}
