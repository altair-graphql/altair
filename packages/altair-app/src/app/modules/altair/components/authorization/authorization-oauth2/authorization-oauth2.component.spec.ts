import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationOauth2Component } from './authorization-oauth2.component';

describe('AuthorizationOauth2Component', () => {
  let component: AuthorizationOauth2Component;
  let fixture: ComponentFixture<AuthorizationOauth2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationOauth2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthorizationOauth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
