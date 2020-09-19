import { NgModule } from '@angular/core';

import { SetCssVariablesDirective } from './set-css-variables/set-css-variables.directive';
import { FileDropDirective } from './file-drop/file-drop.directive';
import { ThemeDirective } from './theme/theme.directive';

const DIRECTIVES = [
    SetCssVariablesDirective,
    FileDropDirective,
    ThemeDirective,
];

@NgModule({
    declarations: DIRECTIVES,
    exports: DIRECTIVES
})
export class DirectivesModule {}
