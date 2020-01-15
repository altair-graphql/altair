import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginPropsFactory } from './plugin-props-factory';
import { Store } from '@ngrx/store';
import { empty as observableEmpty } from 'rxjs';
import { WindowService } from '../window.service';
import { GqlService } from '../gql/gql.service';
import { NotifyService } from '../notify/notify.service';
import { ToastrModule } from 'ngx-toastr';

describe('PluginRegistryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule,
      ToastrModule.forRoot()
    ],
    providers: [
      PluginRegistryService,
      PluginPropsFactory,
      WindowService,
      GqlService,
      NotifyService,
      { provide: Store, useValue: {
        subscribe: () => observableEmpty(),
        select: () => observableEmpty(),
        map: () => observableEmpty(),
        first: () => observableEmpty(),
        pipe: () => observableEmpty(),
        dispatch: () => {}
      } },
    ]
  }));

  it('should be created', () => {
    const service: PluginRegistryService = TestBed.get(PluginRegistryService);
    expect(service).toBeTruthy();
  });
});
