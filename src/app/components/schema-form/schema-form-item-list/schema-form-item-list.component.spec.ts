import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFormItemListComponent } from './schema-form-item-list.component';

describe('SchemaFormItemListComponent', () => {
  let component: SchemaFormItemListComponent;
  let fixture: ComponentFixture<SchemaFormItemListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaFormItemListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
