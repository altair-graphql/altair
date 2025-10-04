import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DocViewerDirectiveComponent } from './doc-viewer-directive.component';

describe('DocViewerDirectiveComponent', () => {
  let component: DocViewerDirectiveComponent;
  let fixture: ComponentFixture<DocViewerDirectiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DocViewerDirectiveComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
