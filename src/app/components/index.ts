import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ClarityModule } from 'clarity-angular';
import { CodemirrorModule } from 'ng2-codemirror';

import { SharedModule } from '../shared/shared.module';

import { PipesModule } from '../pipes';

import { QueryEditorComponent } from './query-editor/query-editor.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { UrlBoxComponent } from './url-box/url-box.component';
import { SetVariableDialogComponent } from './set-variable-dialog/set-variable-dialog.component';
import { ForkRepoComponent } from './fork-repo/fork-repo.component';
import { WindowSwitcherComponent } from './window-switcher/window-switcher.component';
import { SubscriptionUrlDialogComponent } from './subscription-url-dialog/subscription-url-dialog.component';
import { SubscriptionResultItemComponent } from './subscription-result-item/subscription-result-item.component';

const COMPONENTS = [
    QueryEditorComponent,
    QueryResultComponent,
    ActionBarComponent,
    SetVariableDialogComponent,
    ForkRepoComponent,
    WindowSwitcherComponent,
    SubscriptionUrlDialogComponent,
    SubscriptionResultItemComponent,
    UrlBoxComponent
];

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      CodemirrorModule,
      PipesModule,
      SharedModule,
      ClarityModule.forRoot()
    ],
    declarations: COMPONENTS,
    exports: [...COMPONENTS, ClarityModule ]
})
export class ComponentModule {}
