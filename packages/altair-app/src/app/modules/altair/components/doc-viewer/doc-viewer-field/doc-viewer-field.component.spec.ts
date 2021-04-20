import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DocViewerFieldComponent } from './doc-viewer-field.component';
import { DocViewerTypeComponent } from '../doc-viewer-type/doc-viewer-type.component';

describe('DocViewerFieldComponent', () => {
  let component: DocViewerFieldComponent;
  let fixture: ComponentFixture<DocViewerFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DocViewerFieldComponent,
        DocViewerTypeComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        SharedModule
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
