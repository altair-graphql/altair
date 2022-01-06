import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/gql-current-user.decorator';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { RequestUser } from 'src/auth/types';
import { UsersService } from './users.service';

@UseGuards(GqlJwtAuthGuard)
@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  async getUserById(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Query()
  async profile(@CurrentUser() user: RequestUser) {
    return this.usersService.findByEmail(user.email);
  }

  @Mutation()
  async getOrCreateUser(@CurrentUser() user: RequestUser) {
    const x = await this.usersService.findOrCreateUserByRequestUser(user);
    console.log(x);
    return x;
  }
}
