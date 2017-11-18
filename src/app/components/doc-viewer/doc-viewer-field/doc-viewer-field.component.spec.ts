import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { DocViewerFieldComponent } from './doc-viewer-field.component';
import { DocViewerTypeComponent } from '../doc-viewer-type/doc-viewer-type.component';

describe('DocViewerFieldComponent', () => {
  let component: DocViewerFieldComponent;
  let fixture: ComponentFixture<DocViewerFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DocViewerFieldComponent,
        DocViewerTypeComponent
      ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
