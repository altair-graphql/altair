import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgxElectronModule
  ],
  exports: [
    TranslateModule,
    NgxElectronModule
  ]
})
export class SharedModule { }
