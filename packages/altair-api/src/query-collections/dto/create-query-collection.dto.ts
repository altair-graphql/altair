import { ICreateQueryCollectionDto } from '@altairgraphql/api-utils';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateQuerySansCollectionIdDto } from 'src/queries/dto/create-query.dto';

export class CreateQueryCollectionDto implements ICreateQueryCollectionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ValidateNested()
  @ApiProperty()
  queries?: CreateQuerySansCollectionIdDto[];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  teamId?: string;
}
