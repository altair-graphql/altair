import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { NgPipesModule } from 'ngx-pipes';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { MarkdownModule } from 'ngx-markdown';
import { HotToastModule } from '@ngneat/hot-toast';
import { ResizableModule } from 'angular-resizable-element';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { IconsModule } from '../icons/icons.module';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

const AntdComponentModules = [
  NzButtonModule,
  NzInputModule,
  NzInputNumberModule,
  NzAutocompleteModule,
  NzCheckboxModule,
  NzFormModule,
  NzGridModule,
  NzTabsModule,
  NzSelectModule,
  NzModalModule,
  NzDropDownModule,
  NzSwitchModule,
  NzListModule,
  NzRadioModule,
  NzAlertModule,
  NzLayoutModule,
  NzMenuModule,
  NzCollapseModule,
  NzToolTipModule,
  NzTableModule,
  NzTreeSelectModule,
  NzPopoverModule,
  NzAvatarModule,
  // NgZorroAntdModule,
];

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    TranslateModule.forRoot(),
    NgPipesModule,
    NguiAutoCompleteModule, // use antd
    MarkdownModule.forRoot(),
    ResizableModule,
    IconsModule,
    // ToastrModule.forRoot({
    //   newestOnTop: false,
    //   closeButton: true,
    //   positionClass: 'toast-top-center',
    //   enableHtml: true,
    //   countDuplicates: true,
    //   preventDuplicates: true,
    //   resetTimeoutOnDuplicate: true,
    // }),
    // HotToastModule.forRoot({
    //   position: 'top-center',
    //   reverseOrder: true,
    //   dismissible: true,
    //   closeStyle: {
    //     backgroundImage: `none`,
    //   },
    // }),
    ...AntdComponentModules,
  ],

  // DON'T FORGET TO EXPORT MODULE
  exports: [
    DragDropModule,
    TranslateModule,
    NgPipesModule,
    NguiAutoCompleteModule,
    MarkdownModule,
    ResizableModule,
    IconsModule,
    HotToastModule,
    ...AntdComponentModules,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
