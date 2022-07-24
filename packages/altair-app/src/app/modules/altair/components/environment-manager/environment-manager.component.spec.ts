import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnvironmentManagerComponent } from './environment-manager.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../modules/shared/shared.module';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { CodemirrorComponent } from '../codemirror/codemirror.component';

describe('EnvironmentManagerComponent', () => {
  let component: EnvironmentManagerComponent;
  let fixture: ComponentFixture<EnvironmentManagerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EnvironmentManagerComponent, CodemirrorComponent],
        imports: [
          NoopAnimationsModule,
          FormsModule,
          CodemirrorModule,
          SharedModule,
          TranslateModule.forRoot(),
        ],
        teardown: { destroyAfterEach: false },
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
