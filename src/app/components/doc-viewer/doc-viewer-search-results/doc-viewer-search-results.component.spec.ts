import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocViewerSearchResultsComponent } from './doc-viewer-search-results.component';

describe('DocViewerSearchResultsComponent', () => {
  let component: DocViewerSearchResultsComponent;
  let fixture: ComponentFixture<DocViewerSearchResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocViewerSearchResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
