import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRequestCollectionDto } from './dto/create-request-collection.dto';
import { UpdateRequestCollectionDto } from './dto/update-request-collection.dto';
import {
  RequestCollection,
  RequestCollectionDocument,
} from './entities/request-collection.entity';

@Injectable()
export class RequestCollectionsService {
  constructor(
    @InjectModel(RequestCollection.name)
    private RequestCollectionModel: Model<RequestCollectionDocument>,
  ) {}
  async create(createRequestCollectionDto: CreateRequestCollectionDto) {
    if (!createRequestCollectionDto) {
      throw new Error('request collection data not provided!');
    }
    if (!createRequestCollectionDto.ownerId) {
      throw new Error('owner must be specified!');
    }

    const createdRequestCollection = new this.RequestCollectionModel(
      createRequestCollectionDto,
    );

    return createdRequestCollection.save();
  }

  async findByOwnerId(ownerId: string) {
    return this.RequestCollectionModel.find({ ownerId });
  }

  findOne(id: number) {
    return `This action returns a #${id} requestCollection`;
  }

  update(id: number, updateRequestCollectionDto: UpdateRequestCollectionDto) {
    return `This action updates a #${id} requestCollection`;
  }

  remove(id: number) {
    return `This action removes a #${id} requestCollection`;
  }
}
