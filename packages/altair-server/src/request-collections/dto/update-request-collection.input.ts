import { CreateRequestCollectionInput } from './create-request-collection.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateRequestCollectionInput extends PartialType(CreateRequestCollectionInput) {
  id: number;
}
