import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';
import { SortablejsModule } from 'angular-sortablejs';
import { NgPipesModule } from 'ngx-pipes';
import { ContextMenuModule } from 'ngx-contextmenu';
import { DndModule } from '@beyerleinf/ngx-dnd';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    // CodemirrorModule,
    ContextMenuModule.forRoot(),
    DndModule.forRoot(),
  ],
  exports: [
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    ContextMenuModule,
    DndModule
  ]
})
export class SharedModule { }
