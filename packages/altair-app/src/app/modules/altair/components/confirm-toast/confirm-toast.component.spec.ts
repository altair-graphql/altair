import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmToastComponent } from './confirm-toast.component';

describe('ConfirmToastComponent', () => {
  let component: ConfirmToastComponent;
  let fixture: ComponentFixture<ConfirmToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmToastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
