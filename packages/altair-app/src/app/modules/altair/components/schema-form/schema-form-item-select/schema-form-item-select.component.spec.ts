import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFormItemSelectComponent } from './schema-form-item-select.component';

describe('SchemaFormItemSelectComponent', () => {
  let component: SchemaFormItemSelectComponent;
  let fixture: ComponentFixture<SchemaFormItemSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchemaFormItemSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaFormItemSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
