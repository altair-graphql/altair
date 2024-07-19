import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Banner, BannerService } from '../../services/banner/banner.service';

@Component({
  selector: 'app-banner-container',
  templateUrl: './banner-container.component.html',
  styles: ``,
})
export class BannerContainerComponent {
  banners$: Observable<Banner[]>;

  constructor(private bannerService: BannerService) {
    this.banners$ = this.bannerService.getBanners();
  }

  onDismiss(id: string) {
    this.bannerService.removeBanner(id);
  }
}
