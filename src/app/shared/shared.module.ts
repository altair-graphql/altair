import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';
import { SortablejsModule } from 'angular-sortablejs';
import { NgPipesModule } from 'ngx-pipes';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule
  ],
  exports: [
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule
  ]
})
export class SharedModule { }
