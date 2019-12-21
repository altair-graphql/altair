import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFormItemComponent } from './schema-form-item.component';
import { SharedModule } from 'app/modules/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SchemaFormModule } from '../schema-form.module';
import { AltairConfig } from 'app/config';

describe('SchemaFormItemComponent', () => {
  let component: SchemaFormItemComponent;
  let fixture: ComponentFixture<SchemaFormItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        SchemaFormModule,
      ],
      declarations: [
        // SchemaFormItemComponent,
      ],
      providers: [
        {
          provide: AltairConfig,
          useValue: new AltairConfig(),
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormItemComponent);
    component = fixture.componentInstance;
    component.data = {};
    component.item = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
