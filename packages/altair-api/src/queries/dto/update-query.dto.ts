import { IUpdateQueryDto } from '@altairgraphql/api-utils';
import { PartialType } from '@nestjs/swagger';
import { CreateQueryDto } from './create-query.dto';

export class UpdateQueryDto
  extends PartialType(CreateQueryDto)
  implements IUpdateQueryDto {}
