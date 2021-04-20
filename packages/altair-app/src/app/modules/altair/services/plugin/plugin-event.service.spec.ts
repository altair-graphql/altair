import { expect, describe, it, beforeEach } from '@jest/globals';
import { TestBed } from '@angular/core/testing';

import { PluginEventService } from './plugin-event.service';

/**
 * subscribe, emit, should callback
 */
describe('PluginEventService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PluginEventService = TestBed.get(PluginEventService);
    expect(service).toBeTruthy();
  });

  it('should call subscriber with data when new event is emitted', () => {
    const service: PluginEventService = TestBed.get(PluginEventService);

    const cb = jest.fn();
    service.on('query-result.change', cb);

    service.emit('query-result.change', { windowId: '123-456-789', data: '{ hello }' });

    expect(cb).toHaveBeenCalledWith({ windowId: '123-456-789', data: '{ hello }' });
  });

  it('should not call subscriber after unsubscribed', () => {
    const service: PluginEventService = TestBed.get(PluginEventService);

    const cb = jest.fn();
    const sub = service.on('query-result.change', cb);

    service.emit('query-result.change', { windowId: '123-456-789', data: '{ hello }' });

    expect(cb).toHaveBeenCalledWith({ windowId: '123-456-789', data: '{ hello }' });

    sub.unsubscribe();

    service.emit('query-result.change', { windowId: '987-654-321', data: '{ bye }' });
    expect(cb).not.toHaveBeenCalledWith({ windowId: '987-654-321', data: '{ bye }' });
  });

  describe('.group', () => {
    it('should still subscribe with the created group', () => {
      const service: PluginEventService = TestBed.get(PluginEventService);

      const grp = service.group();
      const cb = jest.fn();
      grp.on('query-result.change', cb);

      service.emit('query-result.change', { windowId: '123-456-789', data: '{ hello }' });

      expect(cb).toHaveBeenCalledWith({ windowId: '123-456-789', data: '{ hello }' });

    });

    it('can unsubscribe from within the created group', () => {
      const service: PluginEventService = TestBed.get(PluginEventService);

      const grp = service.group();
      const cb = jest.fn();
      grp.on('query-result.change', cb).unsubscribe();

      service.emit('query-result.change', { windowId: '123-456-789', data: '{ hello }' });

      expect(cb).not.toHaveBeenCalledWith({ windowId: '123-456-789', data: '{ hello }' });

    });

    it('can emit from within the created group', () => {
      const service: PluginEventService = TestBed.get(PluginEventService);

      const grp = service.group();
      const cb = jest.fn();
      grp.on('query-result.change', cb);

      grp.emit('query-result.change', { windowId: '123-456-789', data: '{ hello }' });

      expect(cb).toHaveBeenCalledWith({ windowId: '123-456-789', data: '{ hello }' });

    });

    it('should unsubscribe all events subscribed within the group', () => {
      const service: PluginEventService = TestBed.get(PluginEventService);

      const grp = service.group();
      const cb = jest.fn();
      const cb2 = jest.fn();
      grp.on('query-result.change', cb);
      grp.on('current-window.change', cb2);

      service.emit('query-result.change', { windowId: '123-456-789', data: '{ hello }' });
      service.emit('current-window.change', { windowId: '123456789' });

      expect(cb).toHaveBeenCalledWith({ windowId: '123-456-789', data: '{ hello }' });
      expect(cb2).toHaveBeenCalledWith({ windowId: '123456789' });

      grp.unsubscribe();

      service.emit('query-result.change', { windowId: '987-654-321', data: '{ bye }' });
      service.emit('current-window.change', { windowId: '987654321' });

      expect(cb).not.toHaveBeenCalledWith({ windowId: '987-654-321', data: '{ bye }' });
      expect(cb2).not.toHaveBeenCalledWith({ windowId: '987654321' });
    });
  });
});
