import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IconName } from '../../modules/icons/icons';

export interface BannerAction {
  label: string;
  handler: () => void;
}

export interface Banner {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  dismissible: boolean;
  enabled: boolean;
  icon?: IconName;
  actions?: BannerAction[];
  onDismiss?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private banners: Record<string, Banner> = {};
  private bannersSubject = new BehaviorSubject<Banner[]>([]);

  getBanners(): Observable<Banner[]> {
    return this.bannersSubject.asObservable();
  }

  addBanner(id: string, banner: Omit<Banner, 'id' | 'enabled'>): void {
    this.banners[id] = { ...banner, id, enabled: true };
    this.updateBanners();
  }

  removeBanner(id: string): void {
    this.banners[id]?.onDismiss?.();
    delete this.banners[id];
    this.updateBanners();
  }

  clearBanners(): void {
    this.banners = {};
    this.updateBanners();
  }

  enableBanner(id: string): void {
    this.updateBannerStatus(id, true);
  }

  disableBanner(id: string): void {
    this.updateBannerStatus(id, false);
  }

  private updateBannerStatus(id: string, enabled: boolean): void {
    const banner = this.banners[id];
    if (banner) {
      banner.enabled = enabled;
      this.updateBanners();
    }
  }

  private updateBanners(): void {
    this.bannersSubject.next(Object.values(this.banners));
  }
}
