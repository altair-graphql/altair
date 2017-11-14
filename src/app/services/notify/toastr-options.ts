import {ToastOptions} from 'ng2-toastr';

export class CustomOption extends ToastOptions {
  newestOnTop = false;
  showCloseButton = true;
  positionClass = 'toast-top-center';
  enableHTML = true;
}
