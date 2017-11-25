import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionResultItemComponent } from './subscription-result-item.component';

describe('SubscriptionResultItemComponent', () => {
  let component: SubscriptionResultItemComponent;
  let fixture: ComponentFixture<SubscriptionResultItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionResultItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionResultItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
