import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RequestCollectionsService } from './request-collections.service';
import { CreateRequestCollectionDto } from './dto/create-request-collection.dto';
import { UpdateRequestCollectionDto } from './dto/update-request-collection.dto';
import { CurrentUser } from 'src/auth/decorators/gql-current-user.decorator';
import { RequestUser } from 'src/auth/types';
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
    createRequestCollectionDto: CreateRequestCollectionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.requestCollectionsService.create({
      ...createRequestCollectionDto,
      ownerId: user.id,
    });
  }

  @Query('requestCollections')
  findAll(@CurrentUser() user: RequestUser) {
    return this.requestCollectionsService.findByOwnerId(user.id);
  }

  @Query('requestCollection')
  findOne(@Args('id') id: number) {
    return this.requestCollectionsService.findOne(id);
  }

  @Mutation('updateRequestCollection')
  update(
    @Args('updateRequestCollectionInput')
    updateRequestCollectionInput: UpdateRequestCollectionDto,
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
