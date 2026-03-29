import { IBuyCreditDto } from '@altairgraphql/api-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class BuyDto implements IBuyCreditDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  quantity = 1;
}
