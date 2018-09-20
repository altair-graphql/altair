import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariablesEditorComponent } from './variables-editor.component';

describe('VariablesEditorComponent', () => {
  let component: VariablesEditorComponent;
  let fixture: ComponentFixture<VariablesEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariablesEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
