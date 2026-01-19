import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule],
  providers: [
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule {}
