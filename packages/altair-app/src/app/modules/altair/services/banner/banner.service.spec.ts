import { TestBed } from '@angular/core/testing';

import { BannerService } from './banner.service';
import { firstValueFrom } from 'rxjs';

describe('BannerService', () => {
  let service: BannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addBanner', () => {
    it('should add a banner', async () => {
      service.addBanner('banner-1', {
        message: 'Test message',
        type: 'info',
        dismissible: true,
      });

      const banners = await firstValueFrom(service.getBanners());
      expect(banners).toHaveLength(1);
      expect(banners[0]!.id).toBe('banner-1');
      expect(banners[0]!.message).toBe('Test message');
      expect(banners[0]!.enabled).toBe(true);
    });

    it('should add multiple banners', async () => {
      service.addBanner('banner-1', {
        message: 'Message 1',
        type: 'info',
        dismissible: true,
      });
      service.addBanner('banner-2', {
        message: 'Message 2',
        type: 'warning',
        dismissible: false,
      });

      const banners = await firstValueFrom(service.getBanners());
      expect(banners).toHaveLength(2);
      expect(banners[0]!.id).toBe('banner-1');
      expect(banners[1]!.id).toBe('banner-2');
    });
  });

  describe('removeBanner', () => {
    it('should remove a banner', async () => {
      service.addBanner('banner-1', {
        message: 'Test message',
        type: 'info',
        dismissible: true,
      });
      service.removeBanner('banner-1');

      const banners = await firstValueFrom(service.getBanners());
      expect(banners).toHaveLength(0);
    });

    it('should call onDismiss callback when removing banner', async () => {
      const onDismiss = vi.fn();
      service.addBanner('banner-1', {
        message: 'Test message',
        type: 'info',
        dismissible: true,
        onDismiss,
      });
      service.removeBanner('banner-1');

      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('clearBanners', () => {
    it('should clear all banners', async () => {
      service.addBanner('banner-1', {
        message: 'Message 1',
        type: 'info',
        dismissible: true,
      });
      service.addBanner('banner-2', {
        message: 'Message 2',
        type: 'warning',
        dismissible: false,
      });
      service.clearBanners();

      const banners = await firstValueFrom(service.getBanners());
       expect(banners).toHaveLength(0);
    
    });
  });

  describe('enableBanner', () => {
    it('should enable a disabled banner', async () => {
      service.addBanner('banner-1', {
        message: 'Test message',
        type: 'info',
        dismissible: true,
      });
      service.disableBanner('banner-1');
      service.enableBanner('banner-1');

      const banners = await firstValueFrom(service.getBanners());
      expect(banners[0]!.enabled).toBe(true);
    });
  });

  describe('disableBanner', () => {
    it('should disable a banner', async () => {
      service.addBanner('banner-1', {
        message: 'Test message',
        type: 'info',
        dismissible: true,
      });
      service.disableBanner('banner-1');

      const banners = await firstValueFrom(service.getBanners());
      expect(banners[0]!.enabled).toBe(false);
    });
  });

  describe('getBanners', () => {
    it('should return observable of banners', async () => {
      service.addBanner('banner-1', {
        message: 'Test message',
        type: 'info',
        dismissible: true,
      });

      const banners = await firstValueFrom(service.getBanners());
      expect(banners).toBeInstanceOf(Array);
    });
  });
});
