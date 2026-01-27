import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('/login')
    login(@Req() req) {
        return this.authService.login(req.user);
    }
}
