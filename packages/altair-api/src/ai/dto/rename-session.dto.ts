import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RenameSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty()
  title!: string;
}
