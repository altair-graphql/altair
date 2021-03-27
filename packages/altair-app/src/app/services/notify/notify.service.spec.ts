import { TestBed, inject } from '@angular/core/testing';
import { HotToastService } from '@ngneat/hot-toast';
import * as fromRoot from '../../store';

import { NotifyService } from './notify.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { anyFn, mock } from '../../../testing';

let mockHotToastService: HotToastService;
let mockStore: Store<fromRoot.State>;

describe('NotifyService', () => {
  beforeEach(() => {
    mockHotToastService = mock<HotToastService>({
      success: anyFn(),
      error: anyFn(),
      warning: anyFn(),
      show: anyFn(),
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
          provide: HotToastService,
          useFactory: () => mockHotToastService,
        },
      ]
    });
  });

  it('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));

  describe('.success', () => {
    it('should call .exec with passed options', inject([NotifyService], (service: NotifyService) => {
      service.success('message', 'title', { data: {} });

      expect(mockHotToastService.success).toHaveBeenCalledWith(
        'message',
        {
          autoClose: true,
          id: 'message',
        }
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
      mockStore.select = (predicate: any) => of(predicate(state));
      service.warning('message', 'title', { data: {} });

      expect(mockHotToastService.warning).toHaveBeenCalledWith(
        'message',
        {
          autoClose: true,
          id: 'message',
        }
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
      mockStore.select = (predicate: any) => of(predicate(state));
      service.warning('message', 'title', { data: {} });

      expect(mockHotToastService.warning).not.toHaveBeenCalled();
    }));
  });

  describe('.info', () => {
    it('should call .exec with passed options', inject([NotifyService], (service: NotifyService) => {
      service.info('message', 'title', { data: {} });

      expect(mockHotToastService.show).toHaveBeenCalledWith(
        'message',
        {
          autoClose: true,
          id: 'message',
        }
      );
    }));
  });

  describe('.error', () => {
    it('should call .exec with passed options', inject([NotifyService], (service: NotifyService) => {
      service.error('message', 'title', { data: {} });

      expect(mockHotToastService.error).toHaveBeenCalledWith(
        'message',
        {
          autoClose: true,
          id: 'message',
        }
      );
    }));
  });
});
