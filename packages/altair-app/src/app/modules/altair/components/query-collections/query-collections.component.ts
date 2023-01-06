import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  IQueryCollection,
  IQueryCollectionTree,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { QueryCollectionService } from '../../services';

@Component({
  selector: 'app-query-collections',
  templateUrl: './query-collections.component.html',
  styleUrls: ['./query-collections.component.scss'],
})
export class QueryCollectionsComponent implements OnInit, OnChanges {
  @Input() showCollections = true;
  @Input() collections: IQueryCollection[] = [];
  @Input() sortBy = '';
  @Input() loggedIn = false;

  @Output() loadCollectionsChange = new EventEmitter();
  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange = new EventEmitter();
  @Output() deleteCollectionChange: EventEmitter<{
    collectionId: string;
  }> = new EventEmitter();
  @Output() editCollectionChange: EventEmitter<{
    collection: IQueryCollection;
  }> = new EventEmitter();
  @Output() syncCollectionChange: EventEmitter<{
    collection: IQueryCollection;
  }> = new EventEmitter();
  @Output() exportCollectionChange = new EventEmitter();
  @Output() importCollectionsChange = new EventEmitter();
  @Output() syncCollectionsChange = new EventEmitter();
  @Output() sortCollectionsChange = new EventEmitter();

  collectionTrees: IQueryCollectionTree[] = [];

  constructor(private collectionService: QueryCollectionService) {}

  ngOnInit() {
    this.loadCollectionsChange.next();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.collections?.currentValue) {
      this.setCollectionTrees(changes.collections.currentValue);
    }
  }

  setCollectionTrees(collections: IQueryCollection[]) {
    this.collectionTrees =
      this.collectionService.getCollectionTrees(collections);
  }

  trackById(index: number, collection: IQueryCollection) {
    return collection.id;
  }
}
