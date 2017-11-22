import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { DocViewerTypeComponent } from './doc-viewer-type.component';

describe('DocViewerTypeComponent', () => {
  let component: DocViewerTypeComponent;
  let fixture: ComponentFixture<DocViewerTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocViewerTypeComponent ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
