import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';

import * as services from '../../services';

import { SubscriptionUrlDialogComponent } from './subscription-url-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../modules/shared/shared.module';
import * as refreshEditor from '../../utils/codemirror/refresh-editor';
import { MockModule } from 'ng-mocks';
import { CodemirrorComponent } from '../codemirror/codemirror.component';

describe('SubscriptionUrlDialogComponent', () => {
  let component: SubscriptionUrlDialogComponent;
  let fixture: ComponentFixture<SubscriptionUrlDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SubscriptionUrlDialogComponent, CodemirrorComponent],
        imports: [
          BrowserAnimationsModule,
          FormsModule,
          CodemirrorModule,
          SharedModule,
          TranslateModule.forRoot(),
          SharedModule,
        ],
        teardown: { destroyAfterEach: false },
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionUrlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should handle subscriptionUrlChange', () => {
    const subscriptionUrl = 'test';
    component.subscriptionUrl = subscriptionUrl;
    component.subscriptionUrlChange.emit(subscriptionUrl);
    expect(component.subscriptionUrl).toBe(subscriptionUrl);
  });

  it('should handle updateSubscriptionProviderId', () => {
    spyOn(component.subscriptionProviderIdChange, 'emit');

    const providerId = 'test';
    component.updateSubscriptionProviderId(providerId);

    expect(component.subscriptionProviderIdChange.emit).toHaveBeenCalledWith(
      providerId
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
