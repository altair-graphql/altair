import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AltairConfig } from 'app/config';

@Component({
  selector: 'app-schema-form-item',
  templateUrl: './schema-form-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormItemComponent implements OnInit {

  @Input() item: any;
  @Input() data: any;

  @Output() dataChange = new EventEmitter();

  constructor(
    private altairConfig: AltairConfig,
  ) { }

  ngOnInit() {
  }
  getOptionLabel(option: string) {
    return (this.altairConfig.languages as any)[option] || option;
  }
  onInput(event: Event, item: any) {
    // console.log(event, item);
    this.dataChange.next(this.data);
  }

}
