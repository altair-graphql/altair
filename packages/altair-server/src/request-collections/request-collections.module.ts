import { Module } from '@nestjs/common';
import { RequestCollectionsService } from './request-collections.service';
import { RequestCollectionsResolver } from './request-collections.resolver';
import {
  RequestCollection,
  RequestCollectionSchema,
} from './entities/request-collection.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestCollection.name, schema: RequestCollectionSchema },
    ]),
  ],
  providers: [RequestCollectionsResolver, RequestCollectionsService],
})
export class RequestCollectionsModule {}
