import { NgModule } from '@angular/core';

import { KeysPipe } from './keys/keys.pipe';
import { SortPipe } from './sort/sort.pipe';

@NgModule({
  declarations: [KeysPipe, SortPipe],
  exports: [KeysPipe, SortPipe],
})
export class PipesModule { }
