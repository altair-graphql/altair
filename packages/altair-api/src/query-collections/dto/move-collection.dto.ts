import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MoveCollectionDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description:
      'The ID of the parent collection to move into. Set to null to move to the root level.',
  })
  parentCollectionId?: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description:
      'The ID of the workspace to move the collection to. If omitted, the collection stays in its current workspace.',
  })
  workspaceId?: string;
}
