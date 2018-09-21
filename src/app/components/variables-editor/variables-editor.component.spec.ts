import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariablesEditorComponent } from './variables-editor.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';
import { ClarityModule } from 'clarity-angular';
import { TranslateModule } from '@ngx-translate/core';

describe('VariablesEditorComponent', () => {
  let component: VariablesEditorComponent;
  let fixture: ComponentFixture<VariablesEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariablesEditorComponent ],
      imports: [
        FormsModule,
        CodemirrorModule,
        ClarityModule.forRoot(),
        TranslateModule.forRoot()
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
