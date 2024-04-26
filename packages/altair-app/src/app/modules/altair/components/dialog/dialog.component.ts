import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  @Input() showDialog = false;
  @Input() heading = '';
  @Input() subheading = '';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() width = 520;
  @Output() toggleDialog = new EventEmitter();
  @Output() saveChange = new EventEmitter();
  constructor() {}

  onClickSave(e: MouseEvent) {
    this.toggleDialog.emit(!this.showDialog);
    this.saveChange.emit(e);
  }
}
