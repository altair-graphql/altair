import { TestBed } from '@angular/core/testing';
import { SharingService } from './sharing.service';
import { mock, anyFn } from '../../../../../testing';
import * as services from './../../services';
import { WindowService } from '../window.service';
import { NotifyService } from '../notify/notify.service';
import { AccountService } from '../account/account.service';
import { ApiService } from '../api/api.service';
import { copyToClipboard } from '../../utils';
import { consumeQueryParam } from '../../utils/url';

vi.mock('../../utils', () => ({
  copyToClipboard: vi.fn(),
  consumeQueryParam: vi.fn(),
}));

vi.mock('../../utils/url', () => ({
  consumeQueryParam: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  debug: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SharingService', () => {
  let service: SharingService;
  let mockWindowService: WindowService;
  let mockNotifyService: NotifyService;
  let mockAccountService: AccountService;
  let mockApiService: ApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowService = mock<WindowService>({
      importWindowData: vi.fn().mockResolvedValue('window-id'),
      loadQueryFromCollection: vi.fn().mockResolvedValue(undefined),
      getEmptyWindowState: vi.fn().mockReturnValue({
        version: 1,
        type: 'window',
        apiUrl: '',
        headers: [],
        preRequestScript: '',
        preRequestScriptEnabled: false,
        query: '',
        subscriptionUrl: '',
        subscriptionConnectionParams: '',
        variables: '{}',
        windowName: '',
        postRequestScript: '',
        postRequestScriptEnabled: false,
        authorizationType: '',
        authorizationData: {},
      }),
    });
    mockNotifyService = mock<NotifyService>({
      info: anyFn(),
      error: anyFn(),
      success: anyFn(),
    });
    mockAccountService = mock<AccountService>({
      getUser: vi.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
    });
    mockApiService = mock<ApiService>({
      getQueryShareUrl: vi.fn().mockReturnValue('https://share.altairgraphql.com/q/123'),
      getQuery: vi.fn().mockResolvedValue({
        query: { id: 'query-1', query: 'query { hello }' },
        collectionId: 'col-1',
      }),
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AccountService, useValue: mockAccountService },
        { provide: WindowService, useValue: mockWindowService },
        { provide: NotifyService, useValue: mockNotifyService },
      ],
    });
    service = TestBed.inject(SharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkForShareUrl', () => {
    it('should not do anything if no share details in URL', () => {
      (consumeQueryParam as vi.Mock).mockReturnValue(undefined);

      service.checkForShareUrl('https://altairgraphql.com');

      expect(mockWindowService.importWindowData).not.toHaveBeenCalled();
      expect(mockWindowService.loadQueryFromCollection).not.toHaveBeenCalled();
    });

    it('should import window data from shared window-data URL', () => {
      (consumeQueryParam as vi.Mock).mockImplementation((param: string, url: string) => {
        if (param === 'query') return 'query { hello }';
        if (param === 'variables') return '{}';
        if (param === 'endpoint') return 'https://api.example.com';
        return undefined;
      });

      service.checkForShareUrl('https://altairgraphql.com?query=query%20%7B%20hello%20%7D&variables=%7B%7D&endpoint=https%3A%2F%2Fapi.example.com');

      expect(mockWindowService.importWindowData).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'query { hello }',
          variables: '{}',
          apiUrl: 'https://api.example.com',
          windowName: 'From url',
        })
      );
    });
  });
});
