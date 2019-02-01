import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { QueryEditorComponent } from './query-editor.component';
import { FlexResizerComponent } from '../flex-resizer/flex-resizer.component';
import { TranslateModule } from '@ngx-translate/core';
import { VariablesEditorComponent } from '../variables-editor/variables-editor.component';
import { NotifyService, GqlService } from 'app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from 'app/shared/shared.module';
import { ClarityModule } from '@clr/angular';

describe('QueryEditorComponent', () => {
  let component: QueryEditorComponent;
  let fixture: ComponentFixture<QueryEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryEditorComponent, FlexResizerComponent, VariablesEditorComponent ],
      imports: [
        FormsModule,
        HttpClientModule,
        CodemirrorModule,
        SharedModule.forRoot(),
        ToastrModule.forRoot(),
        ClarityModule,
        TranslateModule.forRoot()
      ],
      providers: [
        GqlService,
        NotifyService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
