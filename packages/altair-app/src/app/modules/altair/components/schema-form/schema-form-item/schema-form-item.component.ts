import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';

@Component({
  selector: 'app-schema-form-item',
  templateUrl: './schema-form-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormItemComponent  {

  @Input() item: any;
  @Input() data: any;

  @Output() dataChange = new EventEmitter();

  constructor(
    private altairConfig: AltairConfig,
  ) { }

  

  getOptionLabel(item: any, option: string) {
    switch (item?.key) {
      case 'language':
        return (this.altairConfig.languages as any)[option] || option;
    }
  }
  getSelectOptions(item: any): { label: string, value: string }[] {
    switch (item?.key) {
      case 'language':
        return item.ref.enum.map((content: string) => {
          return {
            label: (this.altairConfig.languages as any)[content] || content,
            value: content,
          };
        });
      default:
        return item.ref.enum.map((content: string) => {
          return {
            label: content,
            value: content,
          };
        });
    }
  }

  onInput(event: Event, item: any) {
    // console.log(event, item);
    this.dataChange.next(this.data);
  }

}
