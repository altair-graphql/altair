import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  async getUserById(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }
}
