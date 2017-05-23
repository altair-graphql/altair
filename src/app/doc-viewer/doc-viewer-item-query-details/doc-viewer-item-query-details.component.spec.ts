import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocViewerItemQueryDetailsComponent } from './doc-viewer-item-query-details.component';

describe('DocViewerItemQueryDetailsComponent', () => {
  let component: DocViewerItemQueryDetailsComponent;
  let fixture: ComponentFixture<DocViewerItemQueryDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocViewerItemQueryDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerItemQueryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
