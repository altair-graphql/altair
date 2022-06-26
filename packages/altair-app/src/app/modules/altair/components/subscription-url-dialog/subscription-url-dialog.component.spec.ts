import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';

import { SubscriptionUrlDialogComponent } from './subscription-url-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../modules/shared/shared.module';
import { CodemirrorComponent } from '../codemirror/codemirror.component';
import { jest } from '@jest/globals';

describe('SubscriptionUrlDialogComponent', () => {
  let component: SubscriptionUrlDialogComponent;
  let fixture: ComponentFixture<SubscriptionUrlDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SubscriptionUrlDialogComponent, CodemirrorComponent],
        imports: [
          NoopAnimationsModule,
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
    jest.spyOn(component.subscriptionProviderIdChange, 'emit');

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
