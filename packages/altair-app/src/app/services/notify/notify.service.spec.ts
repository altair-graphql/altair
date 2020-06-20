import { TestBed, inject } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import * as fromRoot from '../../store';

import { NotifyService } from './notify.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { Mock } from 'ts-mocks';

let mockToastrService: Mock<ToastrService>;
let mockStore: Mock<Store<fromRoot.State>>;

describe('NotifyService', () => {
  beforeEach(() => {
    mockToastrService = new Mock<ToastrService>({
      success: Mock.ANY_FUNC,
      error: Mock.ANY_FUNC,
      warning: Mock.ANY_FUNC,
      info: Mock.ANY_FUNC,
    });
    mockStore = new Mock<Store<fromRoot.State>>();
    TestBed.configureTestingModule({
      providers: [
        NotifyService,
        {
          provide: Store,
          useFactory: () => mockStore.Object,
        },
        {
          provide: ToastrService,
          useFactory: () => mockToastrService.Object,
        },
      ]
    });
  });

  it('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));

  describe('.success', () => {
    it('should call .exec with passed options', inject([NotifyService], (service: NotifyService) => {
      service.success('message', 'title', { data: 'x' });

      expect(mockToastrService.Object.success).toHaveBeenCalledWith(
        'message',
        'title',
        ({
          data: 'x'
        }) as any
      );
    }));
  });

  describe('.warning', () => {
    it(
      'should call .exec with passed options if disableWarnings settings is false',
      inject([NotifyService], (service: NotifyService) => {

      const state = {
        settings: {
          'alert.disableWarnings': false,
        }
      };
      mockStore.extend({ select: (predicate: any) => of(predicate(state)) })
      service.warning('message', 'title', { data: 'x' });

      expect(mockToastrService.Object.warning).toHaveBeenCalledWith(
        'message',
        'title',
        ({
          data: 'x'
        }) as any
      );
    }));

    it(
      'should NOT call .exec if disableWarnings settings is true',
      inject([NotifyService], (service: NotifyService) => {

      const state = {
        settings: {
          'alert.disableWarnings': true,
        }
      };
      mockStore.extend({ select: (predicate: any) => of(predicate(state)) })
      service.warning('message', 'title', { data: 'x' });

      expect(mockToastrService.Object.warning).not.toHaveBeenCalled();
    }));
  });

  describe('.info', () => {
    it('should call .exec with passed options', inject([NotifyService], (service: NotifyService) => {
      service.info('message', 'title', { data: 'x' });

      expect(mockToastrService.Object.info).toHaveBeenCalledWith(
        'message',
        'title',
        ({
          data: 'x'
        }) as any
      );
    }));
  });

  describe('.error', () => {
    it('should call .exec with passed options', inject([NotifyService], (service: NotifyService) => {
      service.error('message', 'title', { data: 'x' });

      expect(mockToastrService.Object.error).toHaveBeenCalledWith(
        'message',
        'title',
        ({
          data: 'x'
        }) as any
      );
    }));
  });
});
