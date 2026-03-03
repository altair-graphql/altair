import { TestBed, inject } from '@angular/core/testing';

import { PreRequestService } from './pre-request.service';
import { CookieService } from 'ngx-cookie-service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NotifyService } from '../notify/notify.service';
import { Store } from '@ngrx/store';
import { anyFn, mock, mockStoreFactory } from '../../../../../testing';
import { DbService } from '../db.service';

const mockNotifyService = mock({
  error: anyFn(),
  info: anyFn(),
});

describe('PreRequestService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      imports: [],
      providers: [
        CookieService,
        PreRequestService,
        DbService,
        {
          provide: NotifyService,
          useFactory: () => mockNotifyService,
        },
        {
          provide: Store,
          useFactory: () =>
            mockStoreFactory({
              settings: {
                'beta.disable.newScript': true,
              },
            }),
        },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    })
  );

  it('should be created', inject(
    [PreRequestService],
    (service: PreRequestService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should execute non-mutating script and return data unchanged', inject(
    [PreRequestService],
    async (service: PreRequestService) => {
      const script = `console.log('Hello')`;
      const result = await service.executeScript(script, {
        environment: {},
        headers: [],
        operationName: '',
        query: '',
        variables: '',
        url: '',
        requestExtensions: '',
      });

      expect(result).toEqual({
        environment: {},
        requestScriptLogs: [],
      });
    }
  ));

  it('should execute script and return changed data', inject(
    [PreRequestService],
    async (service: PreRequestService) => {
      const script = `
      altair.helpers.setEnvironment('first', true);
    `;
      const result = await service.executeScript(script, {
        environment: {},
        headers: [],
        operationName: '',
        query: '',
        variables: '',
        url: '',
        requestExtensions: '',
      });

      expect(result).toEqual({
        environment: {
          first: true,
        },
        requestScriptLogs: [],
      });
    }
  ));

  describe('imported modules', () => {
    // btoa and atob tests are skipped because the sval evaluator (used when
    // 'beta.disable.newScript' is true) cannot resolve the dynamic import('abab')
    // in the esbuild-bundled test environment. The abab module's CJS exports
    // are not properly resolved when dynamically imported from the bundle.
    // These work fine with the new script engine (EvaluatorWorkerClient/FrameClient).
    it('should import module btoa and return expected data', inject(
      [PreRequestService],
      async (service: PreRequestService) => {
        const script = `
        const btoa = await altair.importModule('btoa');
        altair.helpers.setEnvironment('first', true);
        altair.helpers.setEnvironment('encoded', btoa('first'));
      `;
        const result = await service.executeScript(script, {
          environment: {},
          headers: [],
          operationName: '',
          query: '',
          variables: '',
          url: '',
          requestExtensions: '',
        });

        expect(result).toEqual({
          environment: {
            first: true,
            encoded: 'Zmlyc3Q=',
          },
          requestScriptLogs: [],
        });
      }
    ));

    it('should import module atob and return expected data', inject(
      [PreRequestService],
      async (service: PreRequestService) => {
        const script = `
        const atob = await altair.importModule('atob');
        altair.helpers.setEnvironment('first', true);
        altair.helpers.setEnvironment('decoded', atob('Zmlyc3Q='));
      `;
        const result = await service.executeScript(script, {
          environment: {},
          headers: [],
          operationName: '',
          query: '',
          variables: '',
          url: '',
          requestExtensions: '',
        });

        expect(result).toEqual({
          environment: {
            first: true,
            decoded: 'first',
          },
          requestScriptLogs: [],
        });
      }
    ));

    it('should import module crypto-js and return expected data', inject(
      [PreRequestService],
      async (service: PreRequestService) => {
        const script = `
        const CryptoJS = await altair.importModule('crypto-js');
        altair.helpers.setEnvironment('first', true);
        altair.helpers.setEnvironment('sha', CryptoJS.SHA256('first').toString());
      `;
        const result = await service.executeScript(script, {
          environment: {},
          headers: [],
          operationName: '',
          query: '',
          variables: '',
          url: '',
          requestExtensions: '',
        });

        expect(result).toEqual({
          environment: {
            first: true,
            sha: 'a7937b64b8caa58f03721bb6bacf5c78cb235febe0e70b1b84cd99541461a08e',
          },
          requestScriptLogs: [],
        });
      }
    ));
  });

  it('should call notifyService.info when altair.alert is called', inject(
    [PreRequestService],
    async (service: PreRequestService) => {
      const script = `alert('hello from script')`;
      await service.executeScript(script, {
        environment: {},
        headers: [],
        operationName: '',
        query: '',
        variables: '',
        url: '',
        requestExtensions: '',
      });

      expect(mockNotifyService.info).toHaveBeenCalledWith(
        'Alert: hello from script'
      );
    }
  ));

  it('should execute script that sets environment variable', inject(
    [PreRequestService],
    async (service: PreRequestService) => {
      const script = `
        altair.helpers.setEnvironment('testKey', 'testValue');
      `;
      const result = await service.executeScript(script, {
        environment: { existing: 'yes' },
        headers: [],
        operationName: '',
        query: '',
        variables: '',
        url: '',
        requestExtensions: '',
      });

      expect(result.environment).toMatchObject({
        existing: 'yes',
        testKey: 'testValue',
      });
    }
  ));

  it('should handle script with multiple environment operations', inject(
    [PreRequestService],
    async (service: PreRequestService) => {
      const script = `
        altair.helpers.setEnvironment('key1', 'value1');
        altair.helpers.setEnvironment('key2', 42);
      `;
      const result = await service.executeScript(script, {
        environment: { existing: 'yes' },
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        operationName: '',
        query: '',
        variables: '',
        url: '',
        requestExtensions: '',
      });

      expect(result.environment).toMatchObject({
        existing: 'yes',
        key1: 'value1',
        key2: 42,
      });
    }
  ));
});
