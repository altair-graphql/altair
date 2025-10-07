import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocViewerDeprecatedComponent } from './doc-viewer-deprecated.component';

describe('DocViewerDeprecatedComponent', () => {
  let component: DocViewerDeprecatedComponent;
  let fixture: ComponentFixture<DocViewerDeprecatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocViewerDeprecatedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocViewerDeprecatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
