import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('workspaces')
@ApiTags('Workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Req() req: Request, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    const userId = req?.user?.id ?? '';
    return this.workspacesService.create(userId, createWorkspaceDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req?.user?.id ?? '';
    return this.workspacesService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
    const res = await this.workspacesService.findOne(userId, id);
    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto
  ) {
    const userId = req?.user?.id ?? '';
    return this.workspacesService.update(userId, id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
    return this.workspacesService.remove(userId, id);
  }
}
