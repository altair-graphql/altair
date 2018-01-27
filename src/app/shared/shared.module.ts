import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';
import { SortablejsModule } from 'angular-sortablejs';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgxElectronModule,
    SortablejsModule
  ],
  exports: [
    TranslateModule,
    NgxElectronModule,
    SortablejsModule
  ]
})
export class SharedModule { }
