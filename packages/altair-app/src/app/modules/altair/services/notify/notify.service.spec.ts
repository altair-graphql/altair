import { TestBed, inject } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { NotifyService } from './notify.service';
import { Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { mock } from '../../../../../testing';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

vi.mock('sanitize-html', () => ({ default: vi.fn((text: string) => text) }));

const mockSonnerToast = vi.hoisted(() =>
  Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    promise: vi.fn(),
  })
);
vi.mock('ngx-sonner', () => ({ toast: mockSonnerToast }));

// Declared at module level so the service always holds the same object reference.
// With teardown: { destroyAfterEach: false }, the service instance is reused across
// tests; recreating these objects in beforeEach would cause the service to hold a
// stale reference while the test checks a different (newer) mock object.
const mockToastService = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  show: vi.fn(),
};

let mockStore: Store<RootState>;

describe('NotifyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = mock();
    TestBed.configureTestingModule({
      providers: [
        NotifyService,
        {
          provide: Store,
          useFactory: () => mockStore,
        },
        {
          provide: ToastrService,
          useFactory: () => mockToastService,
        },
      ],
      teardown: { destroyAfterEach: false },
    });
  });

  it('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));

  describe('.success', () => {
    it('should call .exec with passed options', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.success('message', 'title', { data: {} });

        expect(mockToastService.success).toHaveBeenCalledWith('message', 'title', {
          data: {},
        });
      }
    ));
  });

  describe('.warning', () => {
    it('should call .exec with passed options if disableWarnings settings is false', inject(
      [NotifyService],
      (service: NotifyService) => {
        const state = {
          settings: {
            'alert.disableWarnings': false,
          },
        };
        mockStore.select = (predicate: any) => of(predicate(state));
        service.warning('message', 'title', { data: {} });

        expect(mockToastService.warning).toHaveBeenCalledWith('message', 'title', {
          data: {},
        });
      }
    ));

    it('should NOT call .exec if disableWarnings settings is true', inject(
      [NotifyService],
      (service: NotifyService) => {
        const state = {
          settings: {
            'alert.disableWarnings': true,
          },
        };
        mockStore.select = (predicate: any) => of(predicate(state));
        service.warning('message', 'title', { data: {} });

        expect(mockToastService.warning).not.toHaveBeenCalled();
      }
    ));
  });

  describe('.info', () => {
    it('should call .exec with passed options', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.info('message', 'title', { data: {} });

        expect(mockToastService.info).toHaveBeenCalledWith('message', 'title', {
          data: {},
        });
      }
    ));
  });

  describe('.error', () => {
    it('should call .exec with passed options', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.error('message', 'title', { data: {} });

        expect(mockToastService.error).toHaveBeenCalledWith('message', 'title', {
          data: {},
        });
      }
    ));
  });

  describe('.errorWithError', () => {
    it('should extract error message from string error', inject(
      [NotifyService],
      async (service: NotifyService) => {
        await service.errorWithError('Error message', 'Default message');

        expect(mockToastService.error).toHaveBeenCalledWith('Error message', '', {});
      }
    ));

    it('should extract error message from object with message property', inject(
      [NotifyService],
      async (service: NotifyService) => {
        const error = { message: 'Object error message' };
        await service.errorWithError(error, 'Default message');

        expect(mockToastService.error).toHaveBeenCalledWith(
          'Object error message',
          '',
          {}
        );
      }
    ));

    it('should use default message if error has no message', inject(
      [NotifyService],
      async (service: NotifyService) => {
        const error = { code: 500 };
        await service.errorWithError(error, 'Default message');

        expect(mockToastService.error).toHaveBeenCalledWith(
          'Default message',
          '',
          {}
        );
      }
    ));

    it('should extract message from nested err.error.message', inject(
      [NotifyService],
      async (service: NotifyService) => {
        const error = {
          error: { code: 'ERR_001', message: 'Nested error message' },
        };
        await service.errorWithError(error, 'Default message');

        expect(mockToastService.error).toHaveBeenCalledWith(
          'Nested error message',
          '',
          {}
        );
      }
    ));

    it('should use default message when error is null', inject(
      [NotifyService],
      async (service: NotifyService) => {
        await service.errorWithError(null, 'Default message');

        expect(mockToastService.error).toHaveBeenCalledWith(
          'Default message',
          '',
          {}
        );
      }
    ));
  });

  describe('.exec with callbacks', () => {
    it('should call action callback when toast is tapped', inject(
      [NotifyService],
      (service: NotifyService) => {
        const onTapSubject = new Subject();
        mockToastService.success.mockReturnValueOnce({ onTap: onTapSubject });

        const action = vi.fn();
        service.exec('success', 'message', 'title', { data: { action } });

        onTapSubject.next(undefined);

        expect(action).toHaveBeenCalled();
      }
    ));

    it('should open url when toast with url is tapped', inject(
      [NotifyService],
      (service: NotifyService) => {
        const onTapSubject = new Subject();
        mockToastService.info.mockReturnValueOnce({ onTap: onTapSubject });

        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        service.exec('info', 'message', 'title', {
          data: { url: 'https://example.com' },
        });

        onTapSubject.next(undefined);

        expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
        openSpy.mockRestore();
      }
    ));
  });

  describe('.electronPushNotify', () => {
    it('should create a notification when push notifications are enabled', inject(
      [NotifyService],
      (service: NotifyService) => {
        const state = { settings: { disablePushNotification: false } };
        mockStore.select = (predicate: any) => of(predicate(state));

        const mockNotificationInstance = { onclick: null };
        const MockNotification = vi.fn(() => mockNotificationInstance);
        (global as any).Notification = MockNotification;

        service.electronPushNotify('Test message', 'Test Title');

        return Promise.resolve().then(() => {
          expect(MockNotification).toHaveBeenCalledWith('Test Title', {
            body: 'Test message',
          });
          delete (global as any).Notification;
        });
      }
    ));

    it('should not create a notification when push notifications are disabled', inject(
      [NotifyService],
      (service: NotifyService) => {
        const state = { settings: { disablePushNotification: true } };
        mockStore.select = (predicate: any) => of(predicate(state));

        const MockNotification = vi.fn();
        (global as any).Notification = MockNotification;

        service.electronPushNotify('Test message');

        return Promise.resolve().then(() => {
          expect(MockNotification).not.toHaveBeenCalled();
          delete (global as any).Notification;
        });
      }
    ));
  });

  describe('.sonner', () => {
    it('should call sonnerToast with message and options', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.sonner('Hello!');
        expect(mockSonnerToast).toHaveBeenCalledWith('Hello!', {});
      }
    ));

    it('should pass options through to sonnerToast', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.sonner('Hello!', { description: 'desc' });
        expect(mockSonnerToast).toHaveBeenCalledWith('Hello!', { description: 'desc' });
      }
    ));
  });

  describe('.confirm', () => {
    it('should call sonnerToast with title, Infinity duration, and default labels', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.confirm('Are you sure?', 'Altair');

        expect(mockSonnerToast).toHaveBeenCalledWith(
          'Altair',
          expect.objectContaining({
            duration: Number.POSITIVE_INFINITY,
            description: 'Are you sure?',
            action: expect.objectContaining({ label: 'Confirm' }),
            cancel: expect.objectContaining({ label: 'Cancel' }),
          })
        );
      }
    ));

    it('should use custom confirmLabel and cancelLabel', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.confirm('Are you sure?', 'Altair', {
          confirmLabel: 'Yes',
          cancelLabel: 'No',
        });

        expect(mockSonnerToast).toHaveBeenCalledWith(
          'Altair',
          expect.objectContaining({
            action: expect.objectContaining({ label: 'Yes' }),
            cancel: expect.objectContaining({ label: 'No' }),
          })
        );
      }
    ));

    it('should resolve true when the action onClick is called', inject(
      [NotifyService],
      async (service: NotifyService) => {
        const promise = service.confirm('Are you sure?');

        const { action } = mockSonnerToast.mock.calls[0][1];
        action.onClick(new MouseEvent('click'));

        await expect(promise).resolves.toBe(true);
      }
    ));

    it('should resolve false when the cancel onClick is called', inject(
      [NotifyService],
      async (service: NotifyService) => {
        const promise = service.confirm('Are you sure?');

        const { cancel } = mockSonnerToast.mock.calls[0][1];
        cancel.onClick();

        await expect(promise).resolves.toBe(false);
      }
    ));

    it('should resolve false when onDismiss is called', inject(
      [NotifyService],
      async (service: NotifyService) => {
        const promise = service.confirm('Are you sure?');

        const { onDismiss } = mockSonnerToast.mock.calls[0][1];
        onDismiss({});

        await expect(promise).resolves.toBe(false);
      }
    ));

    it('should only resolve once even if multiple callbacks fire', inject(
      [NotifyService],
      async (service: NotifyService) => {
        const promise = service.confirm('Are you sure?');

        const { action, onDismiss } = mockSonnerToast.mock.calls[0][1];
        action.onClick(new MouseEvent('click'));
        onDismiss({});

        await expect(promise).resolves.toBe(true);
      }
    ));

    it('should forward extra ExternalToast options', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.confirm('Are you sure?', 'Altair', {
          closeButton: true,
        });

        expect(mockSonnerToast).toHaveBeenCalledWith(
          'Altair',
          expect.objectContaining({ closeButton: true })
        );
      }
    ));
  });
});
