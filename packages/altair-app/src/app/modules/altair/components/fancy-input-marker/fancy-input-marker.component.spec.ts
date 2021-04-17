import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { SharedModule } from '../../modules/shared/shared.module';
import { MockModule } from 'ng-mocks';
import { mockStoreFactory } from '../../../../../testing';

import { FancyInputMarkerComponent } from './fancy-input-marker.component';

describe('FancyInputMarkerComponent', () => {
  let component: FancyInputMarkerComponent;
  let fixture: ComponentFixture<FancyInputMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FancyInputMarkerComponent ],
      imports: [
        MockModule(SharedModule),
      ],
      providers: [
        {
          provide: Store,
          useValue: mockStoreFactory(),
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FancyInputMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
