import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    TranslateModule
  ]
})
export class SharedModule { }
