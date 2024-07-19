import {
  maxMessageChars,
  maxGraphqlQueryChars,
  maxGraphqlVariablesChars,
  maxSdlChars,
} from 'altair-graphql-core/build/cjs/ai/constants';
import { ISendMessageDto } from '@altairgraphql/api-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageDto implements ISendMessageDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(maxMessageChars)
  message!: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @MaxLength(maxSdlChars)
  sdl?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @MaxLength(maxGraphqlQueryChars)
  graphqlQuery?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @MaxLength(maxGraphqlVariablesChars)
  graphqlVariables?: string;
}
