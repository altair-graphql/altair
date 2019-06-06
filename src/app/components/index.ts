import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { SharedModule } from '../shared/shared.module';

import { PipesModule } from '../pipes';
import { DirectivesModule } from '../directives';

import { QueryEditorComponent } from './query-editor/query-editor.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { UrlBoxComponent } from './url-box/url-box.component';
import { SetVariableDialogComponent } from './set-variable-dialog/set-variable-dialog.component';
import { ForkRepoComponent } from './fork-repo/fork-repo.component';
import { WindowSwitcherComponent } from './window-switcher/window-switcher.component';
import { SubscriptionUrlDialogComponent } from './subscription-url-dialog/subscription-url-dialog.component';
import { SubscriptionResultItemComponent } from './subscription-result-item/subscription-result-item.component';
import { HistoryDialogComponent } from './history-dialog/history-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { ImportCurlDialogComponent } from './import-curl-dialog/import-curl-dialog.component';
import { FlexResizerComponent } from './flex-resizer/flex-resizer.component';
import { VariablesEditorComponent } from './variables-editor/variables-editor.component';
import { QueryCollectionsComponent } from './query-collections/query-collections.component';
import { QueryCollectionItemComponent } from './query-collection-item/query-collection-item.component';
import { DialogComponent } from './dialog/dialog.component';
import { EditCollectionDialogComponent } from './edit-collection-dialog/edit-collection-dialog.component';
import { EnvironmentManagerComponent } from './environment-manager/environment-manager.component';
import { FancyInputComponent } from './fancy-input/fancy-input.component';
import { PreRequestEditorComponent } from './pre-request-editor/pre-request-editor.component';

const COMPONENTS = [
  QueryEditorComponent,
  QueryResultComponent,
  ActionBarComponent,
  SetVariableDialogComponent,
  ForkRepoComponent,
  WindowSwitcherComponent,
  SubscriptionUrlDialogComponent,
  SubscriptionResultItemComponent,
  UrlBoxComponent,
  HistoryDialogComponent,
  SettingsDialogComponent,
  ImportCurlDialogComponent,
  FlexResizerComponent,
  VariablesEditorComponent,
  QueryCollectionsComponent,
  QueryCollectionItemComponent,
  DialogComponent,
  EditCollectionDialogComponent,
  EnvironmentManagerComponent,
  FancyInputComponent,
  PreRequestEditorComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CodemirrorModule,
    PipesModule,
    DirectivesModule,
    SharedModule,
    ClarityModule,
  ],
  declarations: COMPONENTS,
  exports: [ ...COMPONENTS ]
})
export class ComponentModule {}
