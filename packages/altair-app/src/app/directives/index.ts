import { NgModule } from '@angular/core';

import { SetCssVariablesDirective } from './set-css-variables/set-css-variables.directive';
import { FileDropDirective } from './file-drop/file-drop.directive';

@NgModule({
    declarations: [
        SetCssVariablesDirective,
        FileDropDirective,
    ],
    exports: [
        SetCssVariablesDirective,
        FileDropDirective,
    ]
})
export class DirectivesModule {}
