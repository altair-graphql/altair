import { Component, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { Banner, BannerService } from '../../services/banner/banner.service';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

@Component({
  selector: 'app-banner-container',
  templateUrl: './banner-container.component.html',
  styles: ``,
  standalone: false,
})
export class BannerContainerComponent {
  private readonly bannerService = inject(BannerService);
  private readonly store = inject<Store<RootState>>(Store);

  banners$: Observable<Banner[]>;

  constructor() {
    const bannersDisabled = this.store.select(
      (state) => state.settings['banners.disable']
    );
    this.banners$ = combineLatest([
      this.bannerService.getBanners(),
      bannersDisabled,
    ]).pipe(
      map(([banners, disabled]) => {
        if (disabled) {
          return [];
        }
        return banners;
      })
    );
  }

  onDismiss(id: string) {
    this.bannerService.removeBanner(id);
  }
}
