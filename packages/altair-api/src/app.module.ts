import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestsModule } from './requests/requests.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'nestjs-prisma';
import { ConfigModule } from '@nestjs/config';
import { PasswordService } from './auth/password/password.service';
import config from './common/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [], // configure your prisma middleware
      },
    }),
    RequestsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PasswordService],
})
export class AppModule {}
