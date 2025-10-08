import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Toast } from 'ngx-toastr';

@Component({
  selector: 'app-confirm-toast',
  templateUrl: './confirm-toast.component.html',
  styles: [],
  animations: [
    trigger('flyInOut', [
      state('inactive', style({ opacity: 0 })),
      state('active', style({ opacity: 1 })),
      state('removed', style({ opacity: 0 })),
      transition('inactive => active', animate('{{ easeTime }}ms {{ easing }}')),
      transition('active => removed', animate('{{ easeTime }}ms {{ easing }}')),
    ]),
  ],
  standalone: false,
  // components with animations don't work well with OnPush change detection
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmToastComponent extends Toast {
  action(event: Event) {
    event.stopPropagation();
    this.toastPackage.triggerAction();
    this.remove();
    return false;
  }
}
