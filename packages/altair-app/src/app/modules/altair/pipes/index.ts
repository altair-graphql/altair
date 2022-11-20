import { NgModule } from '@angular/core';

import { KeysPipe } from './keys/keys.pipe';
import { SortPipe } from './sort/sort.pipe';
import { CollectionTransformPipe } from './collection-transform/collection-transform.pipe';

@NgModule({
  declarations: [KeysPipe, SortPipe, CollectionTransformPipe],
  exports: [KeysPipe, SortPipe, CollectionTransformPipe],
})
export class PipesModule {}
