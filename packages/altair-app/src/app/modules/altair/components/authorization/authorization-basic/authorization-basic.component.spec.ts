import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationBasicComponent } from './authorization-basic.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { ComponentModule } from '../../components.module';
import { Store } from '@ngrx/store';
import { MockModule } from 'ng-mocks';

describe('AuthorizationBasicComponent', () => {
  let component: AuthorizationBasicComponent;
  let fixture: ComponentFixture<AuthorizationBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthorizationBasicComponent],
      imports: [MockModule(SharedModule), MockModule(ComponentModule)],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
