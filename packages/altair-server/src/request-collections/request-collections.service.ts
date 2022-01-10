import { Injectable } from '@nestjs/common';
import { CreateRequestCollectionInput } from './dto/create-request-collection.input';
import { UpdateRequestCollectionInput } from './dto/update-request-collection.input';

@Injectable()
export class RequestCollectionsService {
  create(createRequestCollectionInput: CreateRequestCollectionInput) {
    return 'This action adds a new requestCollection';
  }

  findAll() {
    return `This action returns all requestCollections`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requestCollection`;
  }

  update(id: number, updateRequestCollectionInput: UpdateRequestCollectionInput) {
    return `This action updates a #${id} requestCollection`;
  }

  remove(id: number) {
    return `This action removes a #${id} requestCollection`;
  }
}
