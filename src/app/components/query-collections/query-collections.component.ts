import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IQueryCollection } from 'app/reducers/collection/collection';

@Component({
  selector: 'app-query-collections',
  templateUrl: './query-collections.component.html',
  styleUrls: ['./query-collections.component.scss']
})
export class QueryCollectionsComponent implements OnInit {
  @Input() showCollections = true;
  @Input() collections = [];
  @Input() sortBy = '';

  @Output() loadCollectionsChange = new EventEmitter();
  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange = new EventEmitter();
  @Output() deleteCollectionChange: EventEmitter<{ collectionId: IQueryCollection['id'] }> = new EventEmitter();
  @Output() editCollectionChange: EventEmitter<{ collection: IQueryCollection }> = new EventEmitter();
  @Output() exportCollectionChange = new EventEmitter();
  @Output() importCollectionChange = new EventEmitter();
  @Output() sortCollectionsChange = new EventEmitter();

  constructor(
  ) {
  }

  ngOnInit() {
    this.loadCollectionsChange.next();
  }

  trackById(index: number, collection: IQueryCollection) {
    return collection.id;
  }

}
