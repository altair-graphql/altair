import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-schema-form-item-list',
  templateUrl: './schema-form-item-list.component.html',
  styles: []
})
export class SchemaFormItemListComponent  {

  @Input() item: any;
  @Input() data: any;

  @Output() dataChange = new EventEmitter();

  constructor() { }

  

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
