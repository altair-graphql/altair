import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationBearerComponent } from './authorization-bearer.component';

describe('AuthorizationBearerComponent', () => {
  let component: AuthorizationBearerComponent;
  let fixture: ComponentFixture<AuthorizationBearerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationBearerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthorizationBearerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
