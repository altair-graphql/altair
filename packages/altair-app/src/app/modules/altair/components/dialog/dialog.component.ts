import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
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

  onClickSave(e: Event) {
    this.toggleDialog.emit(!this.showDialog);
    this.saveChange.emit(e);
  }

  onSubmit(e: Event) {
    this.toggleDialog.emit(!this.showDialog);
    this.saveChange.emit(e);
  }
}
