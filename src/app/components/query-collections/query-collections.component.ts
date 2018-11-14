import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-query-collections',
  templateUrl: './query-collections.component.html',
  styleUrls: ['./query-collections.component.scss']
})
export class QueryCollectionsComponent implements OnInit {
  @Input() showCollections = true;
  @Input() collections = [];

  @Output() loadCollectionsChange = new EventEmitter();
  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange = new EventEmitter();
  @Output() deleteCollectionChange: EventEmitter<{ collectionId }> = new EventEmitter();
  @Output() editCollectionChange: EventEmitter<{ collection }> = new EventEmitter();

  constructor(
  ) {
  }

  ngOnInit() {
    this.loadCollectionsChange.next();
  }

}
