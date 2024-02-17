import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { mockStoreFactory } from '../../../../../testing';

import { XInputComponent } from './x-input.component';
import { EnvironmentService } from '../../services';
import { MockService } from 'ng-mocks';

describe('XInputComponent', () => {
  let component: XInputComponent;
  let fixture: ComponentFixture<XInputComponent>;

  beforeEach(async () => {
    const mockStore = mockStoreFactory();
    await TestBed.configureTestingModule({
      declarations: [XInputComponent],
      providers: [
        {
          provide: EnvironmentService,
          useValue: MockService(EnvironmentService),
        },
        {
          provide: Store,
          useValue: mockStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(XInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
