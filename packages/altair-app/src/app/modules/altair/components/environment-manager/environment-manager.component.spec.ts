import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { EnvironmentManagerComponent } from './environment-manager.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../modules/shared/shared.module';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { CodemirrorComponent } from '../codemirror/codemirror.component';
import { MockProvider, MockService } from 'ng-mocks';
import { NotifyService } from '../../services';

describe('EnvironmentManagerComponent', () => {
  let component: EnvironmentManagerComponent;
  let fixture: ComponentFixture<EnvironmentManagerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [EnvironmentManagerComponent, CodemirrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        SharedModule,
        TranslateModule.forRoot(),
      ],
      providers: [MockProvider(NotifyService)],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
