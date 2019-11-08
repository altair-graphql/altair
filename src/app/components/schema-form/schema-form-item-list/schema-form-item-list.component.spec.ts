import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFormItemListComponent } from './schema-form-item-list.component';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SchemaFormModule } from '../schema-form.module';
import { SchemaFormItemComponent } from '../schema-form-item/schema-form-item.component';

describe('SchemaFormItemListComponent', () => {
  let component: SchemaFormItemListComponent;
  let fixture: ComponentFixture<SchemaFormItemListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        SchemaFormModule,
      ],
      declarations: [
        // SchemaFormItemListComponent,
        // SchemaFormItemComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormItemListComponent);
    component = fixture.componentInstance;
    component.data = [];
    component.item = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
