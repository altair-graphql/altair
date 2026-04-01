import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ImportCollectionDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  // TODO: validate this better - it should be an object with a specific structure
  // TODO: we should also add better description
  @IsObject()
  @IsNotEmpty()
  data!: any;

  @IsString()
  @IsOptional()
  parentCollectionId?: string;
}
