import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { constants } from './constants';
import { UsersModule } from './users/users.module';
import { graphqlModuleConfig } from './gql-module-options';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { RequestsModule } from './requests/requests.module';

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
    UsersModule,
    WorkspacesModule,
    RequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
