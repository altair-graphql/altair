import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { constants } from './constants';
import { graphqlModuleConfig } from './gql-module-options';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${constants.database.url}`, {
      authSource: 'admin',
      dbName: 'altair',
      auth: {
        username: constants.database.username,
        password: constants.database.password,
      },
    }),
    GraphQLModule.forRoot(graphqlModuleConfig),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
