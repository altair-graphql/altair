import { IUpdateQueryCollectionDto } from '@altairgraphql/api-utils';
import { PartialType } from '@nestjs/swagger';
import { CreateQueryCollectionDto } from './create-query-collection.dto';

export class UpdateQueryCollectionDto
  extends PartialType(CreateQueryCollectionDto)
  implements IUpdateQueryCollectionDto {}
