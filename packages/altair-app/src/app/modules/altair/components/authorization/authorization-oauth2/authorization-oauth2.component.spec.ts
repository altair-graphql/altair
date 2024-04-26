import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationOauth2Component } from './authorization-oauth2.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { MockModule, MockService } from 'ng-mocks';
import { ComponentModule } from '../../components.module';
import { NotifyService } from 'app/modules/altair/services';

describe('AuthorizationOauth2Component', () => {
  let component: AuthorizationOauth2Component;
  let fixture: ComponentFixture<AuthorizationOauth2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthorizationOauth2Component],
      imports: [MockModule(SharedModule), MockModule(ComponentModule)],
      providers: [
        {
          provide: NotifyService,
          useValue: MockService(NotifyService),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationOauth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
