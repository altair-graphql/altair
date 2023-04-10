import { ICreateQueryDto, IQueryContentDto } from '@altairgraphql/api-utils';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Allow, IsString } from 'class-validator';

export class CreateQueryDto implements ICreateQueryDto {
  @IsString()
  @ApiProperty()
  name: string;

  // TODO: Define stricter validator
  @Allow()
  @ApiProperty()
  content: IQueryContentDto;

  @IsString()
  @ApiProperty()
  collectionId: string;
}

export class CreateQuerySansCollectionIdDto extends OmitType(CreateQueryDto, [
  'collectionId',
] as const) {}
