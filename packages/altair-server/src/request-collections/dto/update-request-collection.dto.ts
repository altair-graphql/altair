import { CreateRequestCollectionDto } from './create-request-collection.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateRequestCollectionDto extends PartialType(
  CreateRequestCollectionDto,
) {
  id: number;
}
