import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';
import { SortablejsModule } from 'angular-sortablejs';
import { NgPipesModule } from 'ngx-pipes';
import { ContextMenuModule } from 'ngx-contextmenu';
import { DndModule } from '@beyerleinf/ngx-dnd';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forRoot(),
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    NguiAutoCompleteModule,
    ContextMenuModule.forRoot(),
    DndModule.forRoot(),
  ],
  exports: [
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    ContextMenuModule,
    DndModule,
    NguiAutoCompleteModule,
  ]
})
export class SharedModule { }
