import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-query-collections',
  templateUrl: './query-collections.component.html',
  styleUrls: ['./query-collections.component.scss']
})
export class QueryCollectionsComponent implements OnInit {
  @Input() showCollections = true;
  constructor() { }

  ngOnInit() {
  }

}
