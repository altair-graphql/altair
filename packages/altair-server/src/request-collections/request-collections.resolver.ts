import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RequestCollectionsService } from './request-collections.service';
import { CreateRequestCollectionInput } from './dto/create-request-collection.input';
import { UpdateRequestCollectionInput } from './dto/update-request-collection.input';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';

@UseGuards(GqlJwtAuthGuard)
@Resolver('RequestCollection')
export class RequestCollectionsResolver {
  constructor(
    private readonly requestCollectionsService: RequestCollectionsService,
  ) {}

  @Mutation('createRequestCollection')
  create(
    @Args('createRequestCollectionInput')
    createRequestCollectionInput: CreateRequestCollectionInput,
  ) {
    return this.requestCollectionsService.create(createRequestCollectionInput);
  }

  @Query('requestCollections')
  findAll() {
    return this.requestCollectionsService.findAll();
  }

  @Query('requestCollection')
  findOne(@Args('id') id: number) {
    return this.requestCollectionsService.findOne(id);
  }

  @Mutation('updateRequestCollection')
  update(
    @Args('updateRequestCollectionInput')
    updateRequestCollectionInput: UpdateRequestCollectionInput,
  ) {
    return this.requestCollectionsService.update(
      updateRequestCollectionInput.id,
      updateRequestCollectionInput,
    );
  }

  @Mutation('removeRequestCollection')
  remove(@Args('id') id: number) {
    return this.requestCollectionsService.remove(id);
  }
}
