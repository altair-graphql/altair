import { ICreateQueryDto, IQueryContentDto } from '@altairgraphql/api-utils';
import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsString } from 'class-validator';

export class CreateQuerySansCollectionIdDto {
  @IsString()
  @ApiProperty()
  name: string;

  // TODO: Define stricter validator
  @Allow()
  @ApiProperty()
  content: IQueryContentDto;
}

export class CreateQueryDto
  extends CreateQuerySansCollectionIdDto
  implements ICreateQueryDto
{
  @IsString()
  @ApiProperty()
  collectionId: string;
}
