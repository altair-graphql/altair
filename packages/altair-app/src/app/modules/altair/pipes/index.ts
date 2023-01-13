import { NgModule } from '@angular/core';

import { KeysPipe } from './keys/keys.pipe';
import { SortPipe } from './sort/sort.pipe';
import { CollectionTransformPipe } from './collection-transform/collection-transform.pipe';
import { DefaultPipe } from './default/default.pipe';

@NgModule({
  declarations: [KeysPipe, SortPipe, CollectionTransformPipe, DefaultPipe],
  exports: [KeysPipe, SortPipe, CollectionTransformPipe, DefaultPipe],
})
export class PipesModule {}
