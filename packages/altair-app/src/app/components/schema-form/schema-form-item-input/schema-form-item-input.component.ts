import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ThemeRegistryService } from 'app/services';

@Component({
  selector: 'app-schema-form-item-input',
  templateUrl: './schema-form-item-input.component.html',
  styles: []
})
export class SchemaFormItemInputComponent implements OnInit {

  @Input() item: any;
  @Input() data: any;

  @Output() dataChange = new EventEmitter();

  constructor(
    private themeRegistry: ThemeRegistryService,
  ) { }

  ngOnInit() {
  }

  getAutocompleteOptions(item: any) {
    switch (item?.key) {
      case 'theme':
        return this.themeRegistry.getAllThemes();
      default:
        return [];
    }
  }

}
