import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFormItemComponent } from './schema-form-item.component';

describe('SchemaFormItemComponent', () => {
  let component: SchemaFormItemComponent;
  let fixture: ComponentFixture<SchemaFormItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaFormItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
