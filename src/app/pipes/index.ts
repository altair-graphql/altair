import { NgModule } from '@angular/core';

import { KeysPipe } from './keys/keys.pipe';
import { SafeHtmlPipe } from './safehtml/safe-html.pipe';

@NgModule({
    declarations: [
        KeysPipe,
        SafeHtmlPipe
    ],
    exports: [
        KeysPipe,
        SafeHtmlPipe
    ]
})
export class PipesModule {}
