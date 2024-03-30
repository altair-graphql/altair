import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationApikeyComponent } from './authorization-apikey.component';

describe('AuthorizationApikeyComponent', () => {
  let component: AuthorizationApikeyComponent;
  let fixture: ComponentFixture<AuthorizationApikeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationApikeyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthorizationApikeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
