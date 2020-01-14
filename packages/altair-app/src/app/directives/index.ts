import { NgModule } from '@angular/core';

import { SetCssVariablesDirective } from './set-css-variables/set-css-variables.directive';

@NgModule({
    declarations: [
        SetCssVariablesDirective,
    ],
    exports: [
        SetCssVariablesDirective,
    ]
})
export class DirectivesModule {}
