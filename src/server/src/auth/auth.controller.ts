import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { signInDto } from './dto/signIn.dto';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signIn: signInDto) {
    return this.authService.signIn(signIn.email, signIn.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
