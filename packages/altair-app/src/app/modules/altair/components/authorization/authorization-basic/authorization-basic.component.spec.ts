import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationBasicComponent } from './authorization-basic.component';

describe('AuthorizationBasicComponent', () => {
  let component: AuthorizationBasicComponent;
  let fixture: ComponentFixture<AuthorizationBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationBasicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
