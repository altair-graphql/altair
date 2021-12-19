import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from 'src/types/graphql';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/gql-current-user.decorator';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';
import { RequestUser } from './types';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @UseGuards(GqlLocalAuthGuard)
  @Mutation()
  async login(@CurrentUser() user: RequestUser) {
    return this.authService.login(user);
  }

  @Mutation()
  async registerUser(
    @Args('input') input: CreateUserInput,
    @Args('password') password: string,
  ) {
    return this.authService.registerUser({ ...input, password });
  }
}
