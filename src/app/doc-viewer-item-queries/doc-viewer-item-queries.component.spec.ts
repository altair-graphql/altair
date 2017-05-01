import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocViewerItemQueriesComponent } from './doc-viewer-item-queries.component';

describe('DocViewerItemQueriesComponent', () => {
  let component: DocViewerItemQueriesComponent;
  let fixture: ComponentFixture<DocViewerItemQueriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocViewerItemQueriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerItemQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
