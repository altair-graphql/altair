import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-schema-form-item-input',
  templateUrl: './schema-form-item-input.component.html',
  styles: []
})
export class SchemaFormItemInputComponent implements OnInit {

  @Input() item;
  @Input() data;

  @Output() dataChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
