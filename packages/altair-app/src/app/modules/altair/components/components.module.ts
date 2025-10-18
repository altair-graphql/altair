import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../modules/shared/shared.module';

import { PipesModule } from '../pipes';
import { DirectivesModule } from '../directives';

import { HeaderComponent } from './header/header.component';
import { QueryEditorComponent } from './query-editor/query-editor.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { UrlBoxComponent } from './url-box/url-box.component';
import { SetVariableDialogComponent } from './set-variable-dialog/set-variable-dialog.component';
import { ForkRepoComponent } from './fork-repo/fork-repo.component';
import { WindowSwitcherComponent } from './window-switcher/window-switcher.component';
import { HistoryDialogComponent } from './history-dialog/history-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { ImportCurlDialogComponent } from './import-curl-dialog/import-curl-dialog.component';
import { AddCollectionQueryDialogComponent } from './add-collection-query-dialog/add-collection-query-dialog.component';
import { VariablesEditorComponent } from './variables-editor/variables-editor.component';
import { VariableFileItemComponent } from './variable-file-item/variable-file-item.component';
import { QueryCollectionsComponent } from './query-collections/query-collections.component';
import { QueryCollectionItemComponent } from './query-collection-item/query-collection-item.component';
import { DialogComponent } from './dialog/dialog.component';
import { EditCollectionDialogComponent } from './edit-collection-dialog/edit-collection-dialog.component';
import { EnvironmentManagerComponent } from './environment-manager/environment-manager.component';
import { FancyInputComponent } from './fancy-input/fancy-input.component';
import { FancyInputMarkerComponent } from './fancy-input-marker/fancy-input-marker.component';
import { PreRequestEditorComponent } from './pre-request-editor/pre-request-editor.component';
import { PostRequestEditorComponent } from './post-request-editor/post-request-editor.component';
import { SchemaFormModule } from './schema-form/schema-form.module';
import { PluginManagerComponent } from './plugin-manager/plugin-manager.component';
import { ElementWrapperComponent } from './element-wrapper/element-wrapper.component';
import { AccountDialogComponent } from './account-dialog/account-dialog.component';
import { CodemirrorComponent } from './codemirror/codemirror.component';
import { ConfirmToastComponent } from './confirm-toast/confirm-toast.component';
import { XInputComponent } from './x-input/x-input.component';
import { BetaIndicatorComponent } from './beta-indicator/beta-indicator.component';
import { TagComponent } from './tag/tag.component';
import { TeamsDialogComponent } from './teams-dialog/teams-dialog.component';
import { UpgradeDialogComponent } from './upgrade-dialog/upgrade-dialog.component';
import { QueryRevisionDialogComponent } from './query-revision-dialog/query-revision-dialog.component';
import { AuthorizationEditorComponent } from './authorization/authorization-editor/authorization-editor.component';
import { AuthorizationBearerComponent } from './authorization/authorization-bearer/authorization-bearer.component';
import { AuthorizationBasicComponent } from './authorization/authorization-basic/authorization-basic.component';
import { AuthorizationApikeyComponent } from './authorization/authorization-apikey/authorization-apikey.component';
import { AuthorizationOauth2Component } from './authorization/authorization-oauth2/authorization-oauth2.component';
import { RequestExtensionsDialogComponent } from './request-extensions-dialog/request-extensions-dialog.component';
import { RequestHandlerDialogComponent } from './request-handler-dialog/request-handler-dialog.component';
import { TipsComponent } from './tips/tips.component';
import { BannerComponent } from './banner/banner.component';
import { BannerContainerComponent } from './banner-container/banner-container.component';
import { HeadersEditorComponent } from './headers-editor/headers-editor.component';
import { WindowSwitcherItemComponent } from './window-switcher-item/window-switcher-item.component';
import { RequestLoaderComponent } from './request-loader/request-loader.component';

// const STANDALONE_COMPONENTS = [];
const COMPONENTS = [
  HeaderComponent,
  QueryEditorComponent,
  QueryResultComponent,
  ActionBarComponent,
  SetVariableDialogComponent,
  ForkRepoComponent,
  WindowSwitcherComponent,
  WindowSwitcherItemComponent,
  UrlBoxComponent,
  HistoryDialogComponent,
  SettingsDialogComponent,
  ImportCurlDialogComponent,
  AddCollectionQueryDialogComponent,
  VariablesEditorComponent,
  VariableFileItemComponent,
  QueryCollectionsComponent,
  QueryCollectionItemComponent,
  DialogComponent,
  EditCollectionDialogComponent,
  EnvironmentManagerComponent,
  FancyInputComponent,
  FancyInputMarkerComponent,
  PreRequestEditorComponent,
  PostRequestEditorComponent,
  PluginManagerComponent,
  ElementWrapperComponent,
  AccountDialogComponent,
  CodemirrorComponent,
  ConfirmToastComponent,
  XInputComponent,
  BetaIndicatorComponent,
  TagComponent,
  TeamsDialogComponent,
  QueryRevisionDialogComponent,
  UpgradeDialogComponent,
  RequestExtensionsDialogComponent,
  RequestHandlerDialogComponent,
  HeadersEditorComponent,
  TipsComponent,
  AuthorizationEditorComponent,
  AuthorizationApikeyComponent,
  AuthorizationBearerComponent,
  AuthorizationBasicComponent,
  AuthorizationOauth2Component,
  BannerComponent,
  BannerContainerComponent,
  RequestLoaderComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    DirectivesModule,
    SharedModule,
    SchemaFormModule,
    // ...STANDALONE_COMPONENTS,
  ],
  declarations: COMPONENTS,
  exports: [...COMPONENTS],
})
export class ComponentModule {}
