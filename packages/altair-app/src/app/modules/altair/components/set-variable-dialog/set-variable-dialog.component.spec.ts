import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SetVariableDialogComponent } from './set-variable-dialog.component';
import { VariablesEditorComponent } from '../variables-editor/variables-editor.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SetVariableDialogComponent', () => {
  let component: SetVariableDialogComponent;
  let fixture: ComponentFixture<SetVariableDialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [SetVariableDialogComponent, VariablesEditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        SharedModule,
        TranslateModule.forRoot(),
      ],
      providers: [],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetVariableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
