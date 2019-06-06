import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreRequestEditorComponent } from './pre-request-editor.component';

describe('PreRequestEditorComponent', () => {
  let component: PreRequestEditorComponent;
  let fixture: ComponentFixture<PreRequestEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreRequestEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreRequestEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
