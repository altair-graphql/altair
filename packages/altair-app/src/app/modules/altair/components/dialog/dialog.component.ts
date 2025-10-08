import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input
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
  readonly heading = input('');
  readonly subheading = input('');
  readonly showHeader = input(true);
  readonly showFooter = input(true);
  readonly width = input(520);
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
