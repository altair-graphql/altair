import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../modules/shared/shared.module';

import { ComponentModule } from '../components.module';

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
