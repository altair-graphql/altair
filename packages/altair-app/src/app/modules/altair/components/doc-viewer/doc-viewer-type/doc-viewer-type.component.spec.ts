import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DocViewerTypeComponent } from './doc-viewer-type.component';

describe('DocViewerTypeComponent', () => {
  let component: DocViewerTypeComponent;
  let fixture: ComponentFixture<DocViewerTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocViewerTypeComponent ],
      imports: [
        TranslateModule.forRoot(),
        SharedModule
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
