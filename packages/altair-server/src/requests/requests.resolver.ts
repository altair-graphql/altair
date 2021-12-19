import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CreateRequestInput, UpdateRequestInput } from 'src/types/graphql';
import { RequestsService } from './requests.service';

@Resolver('Request')
export class RequestsResolver {
  constructor(private readonly requestsService: RequestsService) {}

  @Mutation('createRequest')
  create(@Args('createRequestInput') createRequestInput: CreateRequestInput) {
    return this.requestsService.create(createRequestInput);
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
