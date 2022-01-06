import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/gql-current-user.decorator';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { RequestUser } from 'src/auth/types';
import { CreateRequestInput, UpdateRequestInput } from 'src/types/graphql';
import { RequestsService } from './requests.service';

@UseGuards(GqlJwtAuthGuard)
@Resolver('Request')
export class RequestsResolver {
  constructor(private readonly requestsService: RequestsService) {}

  @Mutation('createRequest')
  create(
    @CurrentUser() user: RequestUser,
    @Args('createRequestInput') createRequestInput: CreateRequestInput,
  ) {
    return this.requestsService.create({
      ...createRequestInput,
      owner: user.id,
    });
  }

  @Query('request')
  findAll() {
    return this.requestsService.findAll();
  }

  @Query('request')
  findOne(@Args('id') id: number) {
    return this.requestsService.findOne(id);
  }

  @Mutation('updateRequest')
  update(@Args('updateRequestInput') updateRequestInput: UpdateRequestInput) {
    return this.requestsService.update(
      updateRequestInput.id,
      updateRequestInput,
    );
  }

  @Mutation('removeRequest')
  remove(@Args('id') id: number) {
    return this.requestsService.remove(id);
  }
}
