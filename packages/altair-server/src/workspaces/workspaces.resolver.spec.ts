import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesResolver } from './workspaces.resolver';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesResolver', () => {
  let resolver: WorkspacesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspacesResolver, WorkspacesService],
    }).compile();

    resolver = module.get<WorkspacesResolver>(WorkspacesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
