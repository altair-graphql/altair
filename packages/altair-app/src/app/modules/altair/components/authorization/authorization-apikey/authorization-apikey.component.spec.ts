import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationApikeyComponent } from './authorization-apikey.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { ComponentModule } from '../../components.module';
import { MockModule } from 'ng-mocks';

describe('AuthorizationApikeyComponent', () => {
  let component: AuthorizationApikeyComponent;
  let fixture: ComponentFixture<AuthorizationApikeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthorizationApikeyComponent],
      imports: [MockModule(SharedModule), MockModule(ComponentModule)],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationApikeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
