import { CreateWorkspaceInput } from './create-workspace.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateWorkspaceInput extends PartialType(CreateWorkspaceInput) {
  id: number;
}
