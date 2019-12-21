import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../modules/shared/shared.module';

import { SchemaFormComponent } from './schema-form/schema-form.component';
import { SchemaFormItemComponent } from './schema-form-item/schema-form-item.component';
import { SchemaFormItemInputComponent } from './schema-form-item-input/schema-form-item-input.component';
import { SchemaFormItemListComponent } from './schema-form-item-list/schema-form-item-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
  ],
  declarations: [
    SchemaFormComponent,
    SchemaFormItemComponent,
    SchemaFormItemInputComponent,
    SchemaFormItemListComponent,
  ],
  exports: [
    SchemaFormComponent,
  ],
})
export class SchemaFormModule { }
