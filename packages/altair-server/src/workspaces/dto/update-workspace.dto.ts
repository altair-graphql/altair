import { CreateWorkspaceDto } from './create-workspace.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
  id: number;
}
