import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { empty as observableEmpty } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SettingsDialogComponent } from './settings-dialog.component';
import {
  NotifyService,
  KeybinderService,
  WindowService,
  DbService,
  ElectronAppService,
  StorageService,
  GqlService,
} from '../../services';
import { Store } from '@ngrx/store';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { SharedModule } from '../../modules/shared/shared.module';
import { SchemaFormModule } from '../schema-form/schema-form.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { MockProviders } from 'ng-mocks';

describe('SettingsDialogComponent', () => {
  let component: SettingsDialogComponent;
  let fixture: ComponentFixture<SettingsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsDialogComponent],
      teardown: { destroyAfterEach: false },
      imports: [
        NoopAnimationsModule,
        FormsModule,
        SharedModule,
        TranslateModule.forRoot(),
        SchemaFormModule,
      ],
      providers: [
        MockProviders(NotifyService),
        KeybinderService,
        MockProviders(WindowService),
        DbService,
        ElectronAppService,
        StorageService,
        GqlService,
        {
          provide: Store,
          useValue: {
            subscribe: () => {},
            select: () => [],
            map: () => observableEmpty(),
            dispatch: () => {},
          },
        },
        {
          provide: AltairConfig,
          useValue: new AltairConfig(),
        },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
