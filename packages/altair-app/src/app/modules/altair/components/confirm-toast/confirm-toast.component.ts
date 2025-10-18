import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Toast } from 'ngx-toastr';

@Component({
  selector: 'app-confirm-toast',
  templateUrl: './confirm-toast.component.html',
  styles: [],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmToastComponent extends Toast {
  action(event: Event) {
    event.stopPropagation();
    this.toastPackage.triggerAction();
    this.remove();
    return false;
  }
}
