import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CodemirrorModule } from 'ng2-codemirror';

import { PipesModule } from '../pipes';

import { QueryEditorComponent } from './query-editor/query-editor.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { SetVariableDialogComponent } from './set-variable-dialog/set-variable-dialog.component';

const COMPONENTS = [
    QueryEditorComponent,
    QueryResultComponent,
    ActionBarComponent,
    SetVariableDialogComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CodemirrorModule,
        PipesModule
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS
})
export class ComponentModule {}
