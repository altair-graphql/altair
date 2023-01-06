import { TestBed, inject } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { NotifyService } from './notify.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { anyFn, mock } from '../../../../../testing';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { MockService } from 'ng-mocks';

let mockToastService: ToastrService;
let mockStore: Store<RootState>;

describe('NotifyService', () => {
  beforeEach(() => {
    mockToastService = MockService(ToastrService, {
      success: anyFn(),
      error: anyFn(),
      warning: anyFn(),
      info: anyFn(),
    });
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
        // mockToastService,
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

        expect(mockToastService.success).toHaveBeenCalledWith(
          'message',
          'title',
          {
            data: {},
          } as any
        );
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

        expect(mockToastService.warning).toHaveBeenCalledWith(
          'message',
          'title',
          {
            data: {},
          } as any
        );
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
        } as any);
      }
    ));
  });

  describe('.error', () => {
    it('should call .exec with passed options', inject(
      [NotifyService],
      (service: NotifyService) => {
        service.error('message', 'title', { data: {} });

        expect(mockToastService.error).toHaveBeenCalledWith(
          'message',
          'title',
          {
            data: {},
          } as any
        );
      }
    ));
  });
});
