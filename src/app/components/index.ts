import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ClarityModule } from 'clarity-angular';
import { CodemirrorModule } from 'ng2-codemirror';

import { PipesModule } from '../pipes';

import { QueryEditorComponent } from './query-editor/query-editor.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { SetVariableDialogComponent } from './set-variable-dialog/set-variable-dialog.component';
import { ForkRepoComponent } from './fork-repo/fork-repo.component';
import { WindowSwitcherComponent } from './window-switcher/window-switcher.component';

const COMPONENTS = [
    QueryEditorComponent,
    QueryResultComponent,
    ActionBarComponent,
    SetVariableDialogComponent,
    ForkRepoComponent,
    WindowSwitcherComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CodemirrorModule,
        PipesModule,
        ClarityModule.forRoot()
    ],
    declarations: COMPONENTS,
    exports: [...COMPONENTS, ClarityModule ]
})
export class ComponentModule {}
