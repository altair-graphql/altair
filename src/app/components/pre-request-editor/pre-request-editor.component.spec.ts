import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreRequestEditorComponent } from './pre-request-editor.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';

describe('PreRequestEditorComponent', () => {
  let component: PreRequestEditorComponent;
  let fixture: ComponentFixture<PreRequestEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreRequestEditorComponent ],
      imports: [
        FormsModule,
        CodemirrorModule,
        SharedModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreRequestEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
