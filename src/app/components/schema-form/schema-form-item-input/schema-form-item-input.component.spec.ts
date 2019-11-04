import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFormItemInputComponent } from './schema-form-item-input.component';

describe('SchemaFormItemInputComponent', () => {
  let component: SchemaFormItemInputComponent;
  let fixture: ComponentFixture<SchemaFormItemInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaFormItemInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormItemInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
