import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class NotifyService {

  constructor(
    private toastr: ToastsManager
  ) {
    this.toastr.onClickToast().subscribe(toast => {
      if (toast.data && toast.data['url']) {
        // navigate to
        window.open(toast.data['url'], '_blank');
      }
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
        // do something before dismiss the toast
        this.toastr.dismissToast(toast);
      }
    });
  }

  success(message, title = 'Altair', opts = {}) {
    return this.exec('success', message, title, opts);
  }
  error(message, title = 'Altair', opts = {}) {
    return this.exec('error', message, title, opts);
  }
  warning(message, title = 'Altair', opts = {}) {
    return this.exec('warning', message, title, opts);
  }
  info(message, title = 'Altair', opts = {}) {
    return this.exec('info', message, title, opts);
  }
  exec(type, message, title, opts) {
    return this.toastr[type](message, title, opts);
  }
}
