import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { ClarityModule } from 'clarity-angular';
import { CodemirrorModule } from 'ng2-codemirror';
import { TranslateModule } from '@ngx-translate/core';

import * as services from '../../services';

import { SubscriptionUrlDialogComponent } from './subscription-url-dialog.component';

describe('SubscriptionUrlDialogComponent', () => {
  let component: SubscriptionUrlDialogComponent;
  let fixture: ComponentFixture<SubscriptionUrlDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionUrlDialogComponent ],
      imports: [
        FormsModule,
        CodemirrorModule,
        ClarityModule.forRoot(),
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionUrlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
