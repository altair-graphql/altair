import { TestBed, inject } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Mock } from 'ts-mocks';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import * as fromRoot from '../../store';
import { GqlService } from './gql.service';
import { NotifyService } from '../notify/notify.service';
import { Store } from '@ngrx/store';
import { empty as observableEmpty, Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';
import { IntrospectionQuery, buildClientSchema } from 'graphql';

import validIntrospectionData from './__mock__/valid-introspection-data';
import { Pos, Token } from 'codemirror';
import { anyFn } from '../../../../../testing';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

let mockHttpClient: HttpClient;
let mockNotifyService: NotifyService;
let mockStore: Store<RootState>;

describe('GqlService', () => {
  beforeEach(() => {
    mockHttpClient = {} as HttpClient;
    mockHttpClient.request = jest.fn(() => {
      return observableEmpty();
    });
    mockStore = {
      subscribe: anyFn(),
    } as Store<RootState>;
    mockNotifyService = {
      error: anyFn(),
      info: anyFn(),
    } as NotifyService;
    TestBed.configureTestingModule({
      providers: [
        GqlService,
        {
          provide: HttpClient,
          useFactory: () => mockHttpClient,
        },
        {
          provide: NotifyService,
          useFactory: () => mockNotifyService,
        },
        {
          provide: Store,
          useFactory: () => mockStore,
        }
      ]
    });
  });

  it('should create successfully', inject([GqlService], (service: GqlService) => {
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
          expect.anything()
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
          expect.anything()
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
          expect.anything(),
          expect.anything(),
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
          expect.anything(),
          expect.anything(),
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
        expect(mockHttpClient.request).toHaveBeenCalled();
        const httpClientArgs = (mockHttpClient.request as any).mock.calls[0];
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
        expect(mockHttpClient.request).toHaveBeenCalled();
        const httpClientArgs = (mockHttpClient.request as any).mock.calls[0];
        expect(httpClientArgs[0]).toBe('post');
        expect(httpClientArgs[1]).toBe('http://test.com');
        const httpConfigArg = httpClientArgs[2];
        expect(httpConfigArg.body).toEqual(expect.any(FormData));
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
        expect(mockHttpClient.request).toHaveBeenCalled();
        const httpClientArgs = (mockHttpClient.request as any).mock.calls[0];
        expect(httpClientArgs[0]).toBe('post');
        expect(httpClientArgs[1]).toBe('http://test.com');
        const httpConfigArg = httpClientArgs[2];
        expect(httpConfigArg.headers.get('Content-Type')).toBe('application/json');
        expect(JSON.parse(httpConfigArg.body)).toEqual({ query: '{}', variables: {}, operationName: null });
      })
    );
  });

  describe('.getIntrospectionRequest()', () => {
    it(
      'should return introspection data',
      inject([GqlService], async(service: GqlService) => {
        let httpClientCallCount = 0;
        mockHttpClient.request = (...args: any) => {
          httpClientCallCount++;
          const [ method, url, options ] = args;
          expect(options.params.get('operationName')).toEqual('IntrospectionQuery');
          switch (httpClientCallCount) {
            case 1: {
              const resp = new HttpResponse<any>({
                body: {
                  data: 'introspection data'
                }
              });
              return of(resp) as any;
            }
            default:
              return of(new HttpResponse<any>({
                body: {
                  data: ''
                }
              })) as any;
          }
        }
      const res = await service.getIntrospectionRequest('http://test.com', {
        method: 'GET'
      }).pipe(first()).toPromise();

      expect(res.response.body).toEqual({
        data: 'introspection data'
      });
    }));

    it(
      'should fetch introspection with old introspection query if first call throws error',
      inject([GqlService], async(service: GqlService) => {
        let httpClientCallCount = 0;
        mockHttpClient.request = (...args: any) => {
          httpClientCallCount++
          switch (httpClientCallCount) {
            case 1: {
              const resp = new HttpErrorResponse({
                error: 'Some network error'
              });
              return of(resp) as any;
            }
            case 2: {
              const resp = new HttpResponse<any>({
                body: {
                  data: 'second introspection data'
                }
              });
              return of(resp) as any;
            }
            default:
              return of(new HttpResponse<any>({
                body: {
                  data: ''
                }
              })) as any;
          }
        }
      const res = await service.getIntrospectionRequest('http://test.com', {
        method: 'GET'
      }).pipe(first()).toPromise();

      expect(res.response.body).toEqual({
        data: 'second introspection data'
      });
    }));

    it(
      'should throw error if second attempt also fails',
      inject([GqlService], async(service: GqlService) => {
        let httpClientCallCount = 0;
        mockHttpClient.request = (...args: any) => {
          httpClientCallCount++
          switch (httpClientCallCount) {
            case 1: {
              const resp = new HttpErrorResponse({
                error: 'Some network error'
              });
              return of(resp) as any;
            }
            case 2: {
              const resp = new HttpErrorResponse({
                error: 'Second network error'
              });
              return of(resp) as any;
            }
            default:
              return of(new HttpResponse<any>({
                body: {
                  data: ''
                }
              })) as any;
          }
        }

        try {
          const res = await service.getIntrospectionRequest('http://test.com', {
            method: 'GET'
          }).pipe(first()).toPromise();
          // Should not be called
          expect(true).toBe(false);
        } catch (err) {
          expect(true).toBe(true);
        }
    }));
  });

  describe('.setHeaders()', () => {
    it('should set headers with default headers', inject([GqlService], async(service: GqlService) => {

      service.setHeaders();

      const headers = service.headers;

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
    }));

    it('should set only enabled headers with default headers', inject([GqlService], async(service: GqlService) => {

      service.setHeaders([
        { key: 'x-header-1', value: 'Header 1', enabled: true },
        { key: 'x-header-2', value: 'Header 2', enabled: false },
        { key: 'x-header-3', value: 'Header 3', enabled: true },
      ]);

      const headers = service.headers;

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
      expect(headers.get('x-header-1')).toBe('Header 1');
      expect(headers.get('x-header-2')).toBe(null);
      expect(headers.get('x-header-3')).toBe('Header 3');
    }));

    it('should NOT set forbidden headers', inject([GqlService], async(service: GqlService) => {

      service.setHeaders([
        { key: 'Origin', value: 'http://mysite.com', enabled: true },
      ]);

      const headers = service.headers;

      expect(headers.get('Origin')).toBe(null);
    }));

    it('should NOT merge default headers is skipDefault is true', inject([GqlService], async(service: GqlService) => {

      service.setHeaders([
        { key: 'x-header-1', value: 'Header 1', enabled: true },
        { key: 'x-header-3', value: 'Header 3', enabled: true },
      ], { skipDefaults: true });

      const headers = service.headers;

      expect(headers.get('Content-Type')).toBe(null);
      expect(headers.get('Accept')).toBe(null);
      expect(headers.get('x-header-1')).toBe('Header 1');
      expect(headers.get('x-header-3')).toBe('Header 3');
    }));
  });

  describe('.getIntrospectionSchema()', () => {
    it('should return null if no introspection data is provided', inject([GqlService], async(service: GqlService) => {

      const schema = service.getIntrospectionSchema();

      expect(schema).toBe(null);
    }));

    it('should return schema for introspection data', inject([GqlService], async(service: GqlService) => {

      const schema = service.getIntrospectionSchema(validIntrospectionData as any);

      expect(schema).toMatchSnapshot();
    }));
    it('should return null if it cannot parse introspection data', inject([GqlService], async(service: GqlService) => {

      const schema = service.getIntrospectionSchema({
        __schema: {
          queryType: {
            name: 'Query',
          }
        }
      } as IntrospectionQuery);

      expect(schema).toBe(null);
    }));
  });

  describe('.hasInvalidFileVariable()', () => {
    it('should return false if no file variables are passed', inject([GqlService], (service: GqlService) => {
      expect(service.hasInvalidFileVariable([])).toBe(false);
    }));

    it('should return true if any file variables has no file data', inject([GqlService], (service: GqlService) => {
      expect(service.hasInvalidFileVariable([ { name: 'file1' } ])).toBe(true);
    }));

    it('should return true if file data of file variables is not a File', inject([GqlService], (service: GqlService) => {
      expect(service.hasInvalidFileVariable([ { name: 'file1', data: {} as any } ])).toBe(true);
    }));

    it('should return true if any file variables has no file name', inject([GqlService], (service: GqlService) => {
      expect(service.hasInvalidFileVariable([ { name: '', data: new File([], 'file') } ])).toBe(true);
    }));

    it('should return false if all file variables are valid', inject([GqlService], (service: GqlService) => {
      expect(service.hasInvalidFileVariable([ { name: 'file1', data: new File([], 'file') } ])).toBe(false);
    }));
  });

  describe('.fillAllFields()', () => {
    it('should return query with fields filled', inject([GqlService], (service: GqlService) => {
      const schema = buildClientSchema(validIntrospectionData as any);
      const query = `
        query {
          GOTHouses(name: "first"){
          }
        }
      `;
      const cursor = new Pos(3);
      const token: Token = {
        start: 10,
        end: 11,
        string: '}',
        state: {
          'level': 0,
          'step': 1,
          'name': null,
          'kind': 'SelectionSet',
          'type': null,
          'rule': [
            {
              'style': 'punctuation'
            },
            {
              'ofRule': 'Selection',
              'isList': true
            },
            {
              'style': 'punctuation'
            }
          ],
          'needsSeperator': false,
          'prevState': {
            'level': 0,
            'step': 3,
            'name': 'GOTHouses',
            'kind': 'Field',
            'type': null,
            'rule': [
              {
                'style': 'property'
              },
              {
                'ofRule': 'Arguments'
              },
              {
                'ofRule': 'Directive',
                'isList': true
              },
              {
                'ofRule': 'SelectionSet'
              }
            ],
            'needsSeperator': false,
            'prevState': {
              'level': 0,
              'step': 0,
              'name': null,
              'kind': 'Selection',
              'type': null,
              'needsSeperator': false,
              'prevState': {
                'level': 0,
                'step': 1,
                'name': null,
                'kind': 'SelectionSet',
                'type': null,
                'rule': [
                  {
                    'style': 'punctuation'
                  },
                  {
                    'ofRule': 'Selection',
                    'isList': true
                  },
                  {
                    'style': 'punctuation'
                  }
                ],
                'needsSeperator': false,
                'prevState': {
                  'level': 0,
                  'step': 4,
                  'name': null,
                  'kind': 'Query',
                  'type': null,
                  'rule': [
                    {
                      'style': 'keyword'
                    },
                    {
                      'ofRule': {
                        'style': 'def'
                      }
                    },
                    {
                      'ofRule': 'VariableDefinitions'
                    },
                    {
                      'ofRule': 'Directive',
                      'isList': true
                    },
                    'SelectionSet'
                  ],
                  'needsSeperator': false,
                  'prevState': {
                    'level': 0,
                    'step': 0,
                    'name': null,
                    'kind': 'Definition',
                    'type': null,
                    'needsSeperator': false,
                    'prevState': {
                      'level': 0,
                      'step': 0,
                      'name': null,
                      'kind': 'Document',
                      'type': null,
                      'rule': [
                        {
                          'ofRule': 'Definition',
                          'isList': true
                        }
                      ],
                      'needsSeperator': false,
                      'prevState': {
                        'level': 0,
                        'step': 0,
                        'name': null,
                        'kind': null,
                        'type': null,
                        'rule': null,
                        'needsSeperator': false,
                        'prevState': null
                      },
                      'indentLevel': 0
                    },
                    'indentLevel': 0
                  },
                  'indentLevel': 0,
                  'needsAdvance': false,
                  'levels': [
                    1
                  ]
                },
                'indentLevel': 1,
                'needsAdvance': false,
                'levels': [
                  1
                ]
              },
              'indentLevel': 1,
              'needsAdvance': false,
              'levels': [
                1
              ]
            },
            'indentLevel': 1,
            'needsAdvance': false,
            'levels': [
              1,
              2
            ]
          },
          'indentLevel': 1,
          'needsAdvance': false,
          'levels': [
            1,
            2
          ],
          'wasSelectionSet': true
        },
        type: 'punctuation'
      };
      const res = service.fillAllFields(schema, query, cursor, token, { maxDepth: 1 });

      expect(res).toMatchSnapshot();
    }));
  });

  describe('.parseQuery()', () => {
    it('should return empty object if empty string', inject([GqlService], (service: GqlService) => {
      expect(service.parseQuery('')).toEqual({
        definitions: [],
        kind: 'Document',
      });
    }));

    it('should return GraphQL document', inject([GqlService], (service: GqlService) => {
      expect(service.parseQuery(`
        query {
          hello
        }
      `)).toMatchSnapshot();
    }));

    it('should return empty object if query is invalid', inject([GqlService], (service: GqlService) => {
      expect(service.parseQuery(`
        query {{
          hello
        }
      `)).toEqual({
        definitions: [],
        kind: 'Document',
      });
    }));
  });

  describe('.isSchema()', () => {
    it('should return true if argument is a GraphQL schema', inject([GqlService], (service: GqlService) => {
      expect(service.isSchema(buildClientSchema(validIntrospectionData as any))).toBe(true);
    }));

    it('should return false if argument is not a GraphQL schema', inject([GqlService], (service: GqlService) => {
      expect(service.isSchema({})).toBe(false);
    }));
  });

  describe('.isSubscriptionQuery()', () => {
    it('should return true if query is a subscription query', inject([GqlService], (service: GqlService) => {
      expect(service.isSubscriptionQuery('subscription { get { id message } }')).toBe(true);
    }));

    it('should return false if query is not a subscription query', inject([GqlService], (service: GqlService) => {
      expect(service.isSubscriptionQuery('query { get { id message } }')).toBe(false);
    }));
  });

  describe('.getOperationNameAtIndex()', () => {
    it('should return name of graphql operation at index position', inject([GqlService], (service: GqlService) => {
      expect(service.getOperationNameAtIndex(`query first { get { id message } }`, 2)).toBe('first');
    }));

    it('should return name of graphql operation at index position for multiple queries', inject([GqlService], (service: GqlService) => {
      expect(service.getOperationNameAtIndex(`
        query first { get { id message } }
        query second { use { id } }
      `, 56)).toBe('second');
    }));
  });

  describe('.nameQuery()', () => {
    it('should return edited query with generated name', inject([GqlService], (service: GqlService) => {
      expect(service.nameQuery(`query { get { id message } }`)).toMatch(/query [A-Za-z0-9_]+ {/);
    }));
  });

  describe('.refactorQuery()', () => {
    it('should return edited query with generated name', inject([GqlService], (service: GqlService) => {
      const _originalRandom = Math.random;
      let cnt = 1;
      Math.random = jest.fn(() => cnt++);
      const res = service.refactorQuery(`
        query{
          GOTHouses(name: "first"){
            id
            url
            name
            region
            titles
            seats
            words
          }
        }
        query{
          GOTHouses(name: "second"){
            id
            url
            name
            region
            titles
            seats
            words
          }
        }
      `, buildClientSchema(validIntrospectionData as any));

      expect(res?.query).toMatchSnapshot();
      expect(res?.variables).toMatchSnapshot();

      Math.random = _originalRandom;
    }));
  });

  describe('.getSDLSync()', () => {
    it('should return empty string for non-schema', inject([GqlService], (service: GqlService) => {
      const sdl = service.getSDLSync({} as any);

      expect(sdl).toBe('');
    }));
    it('should return SDL for schema', inject([GqlService], (service: GqlService) => {
      const sdl = service.getSDLSync(buildClientSchema(validIntrospectionData as any));

      expect(sdl).toBeTruthy();
    }));
  });

  describe('.createStreamClient()', () => {
    it('should return event source', inject([GqlService], (service: GqlService) => {
      const client = service.createStreamClient('http://example.com/stream');

      expect(client.url).toBe('http://example.com/stream');
      expect(client).toEqual(expect.any(EventSource));
    }));
  });

  describe('.closeStreamClient()', () => {
    it('should close client', inject([GqlService], (service: GqlService) => {
      const client = new EventSource('http://example.com/stream');
      const closeSpy = spyOn(client, 'close');
      service.closeStreamClient(client);

      expect(client.close).toHaveBeenCalled();
    }));
  });

  describe('.normalizeFiles()', () => {
    it('should return a list of graphql multipart file upload compliant file variables', inject([GqlService], (service: GqlService) => {
      const files = [
        {
          name: 'first',
          data: new File([''], 'first.file'),
        },
        {
          name: 'second',
          isMultiple: true,
          data: [ new File([''], 'second1.file'), new File([''], 'second2.file'), {} as File ],
        },
        {
          name: 'third',
          data: {} as File,
        },
        {
          name: 'fourth.0',
          data: new File([''], 'fourth.file'),
        },
        {
          name: '',
          data: new File([''], 'unknown.file'),
        },
      ];
      const result = service.normalizeFiles(files);

      // expect(result).toBe('');
      expect(result.resolvedFiles.length).toBe(4);
      expect(result.resolvedFiles).toEqual(expect.arrayContaining([
        {
          name: 'first',
          data: expect.any(File),
        },
        {
          name: 'second.0',
          data: expect.any(File),
        },
        {
          name: 'second.1',
          data: expect.any(File),
        },
        {
          name: 'fourth.0',
          data: expect.any(File),
        },
      ]));
      expect(result.erroneousFiles).toEqual(expect.arrayContaining([
        {
          name: 'second.2',
          data: expect.any(Object),
        },
        {
          name: 'third',
          data: expect.any(Object),
        },
        {
          name: '',
          data: expect.any(File),
        },
      ]));
    }));
    it('should return only the first file data if not multiple and has > 1 data', inject([GqlService], (service: GqlService) => {
      const files = [
        {
          name: 'first',
          data: new File([''], 'first.file'),
        },
        {
          name: 'second',
          data: [ new File([''], 'second1.file') ],
        },
        {
          name: 'third',
          data: [ new File([''], 'third1.file'), new File([''], 'third2.file') ],
        },
      ];
      const result = service.normalizeFiles(files);

      // expect(result).toBe('');
      expect(result.resolvedFiles.length).toBe(3);
      expect(result.resolvedFiles).toEqual(expect.arrayContaining([
        {
          name: 'first',
          data: expect.any(File),
        },
        {
          name: 'second',
          data: expect.any(File),
        },
        {
          name: 'third',
          data: expect.any(File),
        },
      ]));
      expect(result.erroneousFiles.length).toEqual(0);
    }));
  });
});
