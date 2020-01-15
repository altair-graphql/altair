import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFormItemInputComponent } from './schema-form-item-input.component';
import { SharedModule } from 'app/modules/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SchemaFormModule } from '../schema-form.module';

describe('SchemaFormItemInputComponent', () => {
  let component: SchemaFormItemInputComponent;
  let fixture: ComponentFixture<SchemaFormItemInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        SchemaFormModule,
      ],
      declarations: [
        // SchemaFormItemInputComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormItemInputComponent);
    component = fixture.componentInstance;
    component.data = {};
    component.item = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
