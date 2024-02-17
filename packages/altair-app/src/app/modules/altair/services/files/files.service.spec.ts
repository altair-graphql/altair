import { TestBed } from '@angular/core/testing';

import { FilesService } from './files.service';
import { MockService } from 'ng-mocks';
import { WindowService } from '../window.service';
import { NotifyService } from '../notify/notify.service';
import { EnvironmentService } from '../environment/environment.service';
import { GqlService } from '../gql/gql.service';
import { QueryCollectionService } from '../query-collection/query-collection.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WindowService,
          useValue: MockService(WindowService),
        },
        {
          provide: GqlService,
          useValue: MockService(GqlService),
        },
        {
          provide: NotifyService,
          useValue: MockService(NotifyService),
        },
        {
          provide: EnvironmentService,
          useValue: MockService(EnvironmentService),
        },
        {
          provide: QueryCollectionService,
          useValue: MockService(QueryCollectionService),
        },
      ],
    });
    service = TestBed.inject(FilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
