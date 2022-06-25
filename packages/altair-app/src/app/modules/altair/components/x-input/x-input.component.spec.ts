import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XInputComponent } from './x-input.component';

describe('XInputComponent', () => {
  let component: XInputComponent;
  let fixture: ComponentFixture<XInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
