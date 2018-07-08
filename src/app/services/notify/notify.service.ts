import { Injectable } from '@angular/core';
import { ToastrService, ActiveToast } from 'ngx-toastr';

@Injectable()
export class NotifyService {

  constructor(
    private toastr: ToastrService
  ) {
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
  exec(type, message, title, opts): ActiveToast<any> {
    const toast: ActiveToast<any> = this.toastr[type](message, title, opts);
    if (opts.data && opts.data.url) {
      toast.onTap.subscribe(_toast => {
        window.open(opts.data.url, '_blank');
      })
    }
    return toast;
  }
}
