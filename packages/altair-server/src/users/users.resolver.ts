import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from 'src/types/graphql';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  async getUserById(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation()
  async createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }
}
