import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { UsersModule } from './users/users.module.js';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}), UsersModule, AuthModule],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
