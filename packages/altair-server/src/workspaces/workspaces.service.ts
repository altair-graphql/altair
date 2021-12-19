import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace, WorkspaceDocument } from './entities/workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private WorkspaceModel: Model<WorkspaceDocument>,
  ) {}

  create(createWorkspaceDto: CreateWorkspaceDto) {
    if (!createWorkspaceDto) {
      throw new Error('No workspace data provided!');
    }
    if (!createWorkspaceDto.ownerId) {
      throw new Error('Owner must be specified!');
    }

    const createdWorkspace = new this.WorkspaceModel(createWorkspaceDto);

    return createdWorkspace.save();
  }

  findByOwnerId(ownerId: string) {
    return this.WorkspaceModel.find({ ownerId });
  }

  findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  update(id: number, updateWorkspaceInput: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
