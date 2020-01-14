import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-schema-form-item-list',
  templateUrl: './schema-form-item-list.component.html',
  styles: []
})
export class SchemaFormItemListComponent implements OnInit {

  @Input() item: any;
  @Input() data: any;

  @Output() dataChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  addField() {
    if (!this.data || !Array.isArray(this.data)) {
      this.data = [];
    }

    this.data.push('');
    this.dataChange.next(this.data);
  }

  removeField(index: number) {
    if (this.data && Array.isArray(this.data)) {
      this.data = this.data.filter((_, i) => i !== index);
      this.dataChange.next(this.data);
    }
  }

  trackByIndex(index: number) {
    return index;
  }

}
