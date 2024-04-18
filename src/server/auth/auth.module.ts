import { UsersModule } from '../providers/users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      signOptions: { expiresIn: process.env.JWT_VALIDITY || '1d' },
      secret: process.env.JWT_SECRET,
      global: true,
    }),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
