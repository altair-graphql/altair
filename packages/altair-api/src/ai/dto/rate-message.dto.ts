import { IRateMessageDto } from '@altairgraphql/api-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class RateMessageDto implements IRateMessageDto {
  @IsInt()
  @ApiProperty()
  @Min(-1)
  @Max(1)
  rating!: number;
}
