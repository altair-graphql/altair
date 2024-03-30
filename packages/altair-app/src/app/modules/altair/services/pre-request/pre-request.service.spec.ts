import { TestBed, inject } from '@angular/core/testing';

import { PreRequestService } from './pre-request.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule } from '@angular/common/http';
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
      imports: [HttpClientModule],
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
      ],
      teardown: { destroyAfterEach: false },
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
      });

      expect(result).toEqual({
        environment: {},
        requestScriptLogs: [],
        additionalHeaders: [],
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
      });

      expect(result).toEqual({
        environment: {
          first: true,
        },
        requestScriptLogs: [],
        additionalHeaders: [],
      });
    }
  ));

  describe('imported modules', () => {
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
        });

        expect(result).toEqual({
          environment: {
            first: true,
            encoded: 'Zmlyc3Q=',
          },
          requestScriptLogs: [],
          additionalHeaders: [],
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
        });

        expect(result).toEqual({
          environment: {
            first: true,
            decoded: 'first',
          },
          requestScriptLogs: [],
          additionalHeaders: [],
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
        });

        expect(result).toEqual({
          environment: {
            first: true,
            sha: 'a7937b64b8caa58f03721bb6bacf5c78cb235febe0e70b1b84cd99541461a08e',
          },
          requestScriptLogs: [],
          additionalHeaders: [],
        });
      }
    ));
  });
});
