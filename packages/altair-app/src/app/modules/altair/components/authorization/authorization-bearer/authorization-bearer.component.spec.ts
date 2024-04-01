import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationBearerComponent } from './authorization-bearer.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { ComponentModule } from '../../components.module';
import { MockModule } from 'ng-mocks';

describe('AuthorizationBearerComponent', () => {
  let component: AuthorizationBearerComponent;
  let fixture: ComponentFixture<AuthorizationBearerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthorizationBearerComponent],
      imports: [MockModule(SharedModule), MockModule(ComponentModule)],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationBearerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
