import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';
import { SortablejsModule } from 'angular-sortablejs';
import { NgPipesModule } from 'ngx-pipes';
import { ContextMenuModule } from 'ngx-contextmenu';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    ContextMenuModule.forRoot(),
  ],
  exports: [
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    ContextMenuModule
  ]
})
export class SharedModule { }
