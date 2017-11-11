import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class NotifyService {

  constructor(
    private toastr: ToastsManager
  ) {
  }

  success(message, title = 'Altair', opts = {}) {
    this.toastr.success(message, title, opts);
  }
  error(message, title = 'Altair', opts = {}) {
    this.toastr.error(message, title, opts);
  }
  warning(message, title = 'Altair', opts = {}) {
    this.toastr.warning(message, title, opts);
  }
  info(message, title = 'Altair', opts = {}) {
    this.toastr.info(message, title, opts);
  }
}
