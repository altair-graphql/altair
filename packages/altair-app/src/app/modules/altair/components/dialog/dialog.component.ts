import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DialogComponent {
  readonly showDialog = input(false);
  readonly heading = input('');
  readonly subheading = input('');
  readonly showHeader = input(true);
  readonly showFooter = input(true);
  readonly width = input(520);
  readonly toggleDialog = output<boolean>();
  readonly saveChange = output();

  onClickSave(e: Event) {
    this.toggleDialog.emit(!this.showDialog());
    this.saveChange.emit();
  }

  onSubmit(e: Event) {
    this.toggleDialog.emit(!this.showDialog());
    this.saveChange.emit();
  }
}
