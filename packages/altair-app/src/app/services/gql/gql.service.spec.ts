import { TestBed, inject } from '@angular/core/testing';
import { Mock } from 'ts-mocks';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { GqlService } from './gql.service';
import * as services from '../../services';
import { NotifyService } from '../notify/notify.service';
import { ToastrModule } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { empty as observableEmpty } from 'rxjs';

let mockHttpClient: Mock<HttpClient>;

describe('GqlService', () => {
  beforeEach(() => {
    mockHttpClient = new Mock<HttpClient>({
      request() {
        return observableEmpty();
      }
    });
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      providers: [
        {
          provide: HttpClient,
          useFactory: () => mockHttpClient.Object,
        },
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

  describe('.getSelectedOperationData()', () => {
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
  describe('.sendRequest()', () => {
    it(
      'should call HttpClient with expected parameters',
      inject([GqlService], (service: GqlService) => {
        service.sendRequest('http://test.com', {
          method: 'post',
          query: '{}',
        });
        expect(mockHttpClient.Object.request).toHaveBeenCalled();
        const httpClientArgs = (mockHttpClient.Object.request as jasmine.Spy).calls.argsFor(0);
        expect(httpClientArgs[0]).toBe('post');
        expect(httpClientArgs[1]).toBe('http://test.com');
        const httpConfigArg = httpClientArgs[2];
        expect(JSON.parse(httpConfigArg.body)).toEqual({ query: '{}', variables: {}, operationName: null });
        expect(httpConfigArg.headers.get('Content-Type')).toBe('application/json');
      })
    );

    it(
      'should call HttpClient with correct content type when file is included',
      inject([GqlService], (service: GqlService) => {
        service.sendRequest('http://test.com', {
          method: 'post',
          query: '{}',
          files: [
            {
              name: 'file1',
              data: new File([], 'file1'),
            },
            {
              name: 'file2',
              data: new File([], 'file2'),
            }
          ]
        });
        expect(mockHttpClient.Object.request).toHaveBeenCalled();
        const httpClientArgs = (mockHttpClient.Object.request as jasmine.Spy).calls.argsFor(0);
        expect(httpClientArgs[0]).toBe('post');
        expect(httpClientArgs[1]).toBe('http://test.com');
        const httpConfigArg = httpClientArgs[2];
        expect(httpConfigArg.body).toEqual(jasmine.any(FormData));
        expect(httpConfigArg.headers.get('Content-Type')).toBeFalsy();
        expect(JSON.parse(httpConfigArg.body.get('operations'))).toEqual({
          query: '{}',
          variables: {
            file1: null,
            file2: null,
          },
          operationName: null,
        });
      })
    );

    it(
      'should call HttpClient with default json content type if file passed to it is not valid',
      inject([GqlService], (service: GqlService) => {
        service.sendRequest('http://test.com', {
          method: 'post',
          query: '{}',
          files: [
            {
              name: 'file1',
            }
          ]
        });
        expect(mockHttpClient.Object.request).toHaveBeenCalled();
        const httpClientArgs = (mockHttpClient.Object.request as jasmine.Spy).calls.argsFor(0);
        expect(httpClientArgs[0]).toBe('post');
        expect(httpClientArgs[1]).toBe('http://test.com');
        const httpConfigArg = httpClientArgs[2];
        expect(httpConfigArg.headers.get('Content-Type')).toBe('application/json');
        expect(JSON.parse(httpConfigArg.body)).toEqual({ query: '{}', variables: {}, operationName: null });
      })
    );
  });
});
