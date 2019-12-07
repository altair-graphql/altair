import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { getAltairConfig } from 'app/config';

@Component({
  selector: 'app-schema-form-item',
  templateUrl: './schema-form-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormItemComponent implements OnInit {

  @Input() item;
  @Input() data;

  @Output() dataChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }
  getOptionLabel(option) {
    return getAltairConfig().languages[option] || option;
  }
  onInput(event, item) {
    // console.log(event, item);
    this.dataChange.next(this.data);
  }

}
