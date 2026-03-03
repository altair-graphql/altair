import { TestBed } from '@angular/core/testing';
import { SharingService } from './sharing.service';
import { mock, anyFn } from '../../../../../testing';
import { WindowService } from '../window.service';
import { NotifyService } from '../notify/notify.service';
import { AccountService } from '../account/account.service';
import { ApiService } from '../api/api.service';

describe('SharingService', () => {
  let service: SharingService;
  let mockWindowService: WindowService;
  let mockNotifyService: NotifyService;
  let mockAccountService: AccountService;
  let mockApiService: ApiService;

  beforeEach(() => {
    // Prevent cross-origin SecurityError from consumeQueryParam calling
    // window.history.replaceState with a URL from a different origin
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkForShareUrl', () => {
    it('should not do anything if no share details in URL', () => {
      // Pass a URL with no query/q params — consumeQueryParam will return undefined
      service.checkForShareUrl('https://altairgraphql.com');

      expect(mockWindowService.importWindowData).not.toHaveBeenCalled();
      expect(mockWindowService.loadQueryFromCollection).not.toHaveBeenCalled();
    });

    it('should import window data from shared window-data URL', () => {
      // Pass a real URL with query params — consumeQueryParam will extract them
      service.checkForShareUrl(
        'https://altairgraphql.com?query=query%20%7B%20hello%20%7D&variables=%7B%7D&endpoint=https%3A%2F%2Fapi.example.com'
      );

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
