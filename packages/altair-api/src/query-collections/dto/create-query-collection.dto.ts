import { ICreateQueryCollectionDto } from '@altairgraphql/api-utils';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsObject,
} from 'class-validator';
import { CreateQuerySansCollectionIdDto } from 'src/queries/dto/create-query.dto';

export class CreateQueryCollectionDto implements ICreateQueryCollectionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name!: string;

  @IsOptional()
  // @ValidateNested({ each: true })
  @IsArray()
  @ApiProperty()
  @Type(() => CreateQuerySansCollectionIdDto)
  queries?: CreateQuerySansCollectionIdDto[];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  workspaceId?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  teamId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  preRequestScript?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  preRequestScriptEnabled?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty()
  postRequestScript?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  postRequestScriptEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @ApiProperty()
  headers?: { key: string; value: string; enabled: boolean }[];

  @IsObject()
  @IsOptional()
  @ApiProperty()
  environmentVariables?: Record<string, unknown>;
}
