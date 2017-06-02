import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocViewerTypeComponent } from './doc-viewer-type.component';

describe('DocViewerTypeComponent', () => {
  let component: DocViewerTypeComponent;
  let fixture: ComponentFixture<DocViewerTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocViewerTypeComponent ]
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
