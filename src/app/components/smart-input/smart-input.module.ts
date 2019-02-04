import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';

import { ComponentModule } from '..';

import { SmartInputComponent } from './smart-input/smart-input.component';
import { SmartInputBlockComponent } from './smart-input-block/smart-input-block.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ComponentModule,
  ],
  declarations: [
    SmartInputComponent,
    SmartInputBlockComponent,
  ],
  exports: [
    SmartInputComponent,
  ]
})
export class SmartInputModule { }
