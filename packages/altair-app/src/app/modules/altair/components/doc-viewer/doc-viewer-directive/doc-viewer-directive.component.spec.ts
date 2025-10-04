import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DocViewerDirectiveComponent } from './doc-viewer-directive.component';

describe('DocViewerDirectiveComponent', () => {
  let component: DocViewerDirectiveComponent;
  let fixture: ComponentFixture<DocViewerDirectiveComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DocViewerDirectiveComponent],
        imports: [TranslateModule.forRoot(), SharedModule],
        teardown: { destroyAfterEach: false },
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit goToTypeChange when goToType is called', () => {
    spyOn(component.goToTypeChange, 'next');
    component.goToType('String');
    expect(component.goToTypeChange.next).toHaveBeenCalledWith({ name: 'String' });
  });

  it('should return formatted default value when available', () => {
    const arg = {
      name: 'test',
      defaultValue: 42,
      type: {} as any,
    };
    const result = component.getDefaultValue(arg);
    expect(result).toBe('42');
  });

  it('should return undefined when no default value', () => {
    const arg = {
      name: 'test',
      type: {} as any,
    };
    const result = component.getDefaultValue(arg);
    expect(result).toBeUndefined();
  });
});
