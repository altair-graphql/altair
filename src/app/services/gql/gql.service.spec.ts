import { TestBed, inject } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';

import { GqlService } from './gql.service';
import * as services from '../../services';
import { NotifyService } from '../notify/notify.service';
import { ToastrModule } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { empty as observableEmpty } from 'rxjs';

describe('GqlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        GqlService,
        NotifyService,
        { provide: Store, useValue: {
          subscribe: () => observableEmpty(),
          select: () => observableEmpty(),
          map: () => observableEmpty(),
          first: () => observableEmpty(),
          pipe: () => observableEmpty(),
          dispatch: () => {}
        } }
      ]
    });
  });

  it('should ...', inject([GqlService], (service: GqlService) => {
    expect(service).toBeTruthy();
  }));

  describe('.getSelectedOperationData', () => {
    it(
      'should return selectedOperation as null for single queries, without requesting user selection',
      inject([GqlService], (service: GqlService) => {
      expect(service.getSelectedOperationData({
        query: `query abc { hi }`
      })).toEqual({
        requestSelectedOperationFromUser: false,
        operations: [
          jasmine.objectContaining({})
        ],
        selectedOperation: null,
      });
    }));
    it(
      'should return selectedOperation as single query name for single queries, if selectIfOneOperation is set',
      inject([GqlService], (service: GqlService) => {
      expect(service.getSelectedOperationData({
        query: `query abc { hi }`,
        selectIfOneOperation: true,
      })).toEqual({
        requestSelectedOperationFromUser: false,
        operations: [
          jasmine.objectContaining({})
        ],
        selectedOperation: 'abc',
      });
    }));

    it(
      'should return selectedOperation as null for multiple queries, but with requesting user selection',
      inject([GqlService], (service: GqlService) => {
      expect(service.getSelectedOperationData({
        query: `query abc { hi } query bcd{ bye }`
      })).toEqual({
        requestSelectedOperationFromUser: true,
        operations: [
          jasmine.objectContaining({}),
          jasmine.objectContaining({}),
        ],
        selectedOperation: null,
      });
    }));

    it(
      'should return provided selectedOperation if it matches any of the available queries',
      inject([GqlService], (service: GqlService) => {
      expect(service.getSelectedOperationData({
        query: `query abc { hi } query bcd{ bye }`,
        selectedOperation: 'bcd'
      })).toEqual({
        requestSelectedOperationFromUser: false,
        operations: [
          jasmine.objectContaining({}),
          jasmine.objectContaining({}),
        ],
        selectedOperation: 'bcd',
      });
    }));
  });
});
