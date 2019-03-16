import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';
import { SortablejsModule } from 'angular-sortablejs';
import { NgPipesModule } from 'ngx-pipes';
import { ContextMenuModule } from 'ngx-contextmenu';
import { DndModule } from '@beyerleinf/ngx-dnd';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NgxPopperModule } from 'ngx-popper';
import { MarkdownModule } from 'ngx-markdown';

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
    NgxPopperModule.forRoot({
      applyClass: 'tooltip-content',
      trigger: 'hover'
    }),
    MarkdownModule.forRoot(),
  ],

  // DON'T FORGET TO EXPORT MODULE
  exports: [
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    ContextMenuModule,
    DndModule,
    NguiAutoCompleteModule,
    NgxPopperModule,
    MarkdownModule,
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
