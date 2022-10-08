import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { mockStoreFactory } from '../../../../../testing';

import { BetaIndicatorComponent } from './beta-indicator.component';

describe('BetaIndicatorComponent', () => {
  let component: BetaIndicatorComponent;
  let fixture: ComponentFixture<BetaIndicatorComponent>;

  beforeEach(async () => {
    const mockStore = mockStoreFactory();
    await TestBed.configureTestingModule({
      declarations: [BetaIndicatorComponent],
      providers: [
        {
          provide: Store,
          useValue: mockStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BetaIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
