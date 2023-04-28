import { PartialType } from '@nestjs/swagger';
import { CreateWorkspaceDto } from './create-workspace.dto';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}
