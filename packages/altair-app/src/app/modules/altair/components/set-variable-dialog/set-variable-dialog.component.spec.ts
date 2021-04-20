import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';

import * as services from '../../services';
import { SetVariableDialogComponent } from './set-variable-dialog.component';
import { VariablesEditorComponent } from '../variables-editor/variables-editor.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SetVariableDialogComponent', () => {
  let component: SetVariableDialogComponent;
  let fixture: ComponentFixture<SetVariableDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetVariableDialogComponent, VariablesEditorComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        CodemirrorModule,
        SharedModule,
        TranslateModule.forRoot()
      ],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetVariableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
