import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxElectronModule } from 'ngx-electron';
import { SortablejsModule } from 'ngx-sortablejs';
import { NgPipesModule } from 'ngx-pipes';
import { ContextMenuModule } from 'ngx-contextmenu';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { NgxPopperModule } from 'ngx-popper';
import { MarkdownModule } from 'ngx-markdown';
import {
  NzFormModule,
  NzSelectModule,
  NzModalModule,
  NzDropDownModule,
  NzSwitchModule,
  NzListModule,
  NzRadioModule,
  NzAlertModule,
} from 'ng-zorro-antd';
import { IconsModule } from '../icons/icons.module';

const AntdComponentModules = [
  NzFormModule,
  NzSelectModule,
  NzModalModule,
  NzDropDownModule,
  NzSwitchModule,
  NzListModule,
  NzRadioModule,
  NzAlertModule,
];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forRoot(),
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    NguiAutoCompleteModule,
    ContextMenuModule.forRoot(),
    NgxPopperModule.forRoot({
      applyClass: 'tooltip-content',
      trigger: 'hover'
    }),
    MarkdownModule.forRoot(),
    IconsModule,
    ...AntdComponentModules,
  ],

  // DON'T FORGET TO EXPORT MODULE
  exports: [
    TranslateModule,
    NgxElectronModule,
    SortablejsModule,
    NgPipesModule,
    ContextMenuModule,
    NguiAutoCompleteModule,
    NgxPopperModule,
    MarkdownModule,
    IconsModule,
    ...AntdComponentModules,
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
