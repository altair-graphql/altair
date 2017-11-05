import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class NotifyService {

  constructor(
    private toastr: ToastsManager
  ) {
  }

  success(message, title = 'Altair') {
    this.toastr.success(message, title);
  }
  error(message, title = 'Altair') {
    this.toastr.error(message, title);
  }
  warning(message, title = 'Altair') {
    this.toastr.warning(message, title);
  }
  info(message, title = 'Altair') {
    this.toastr.info(message, title);
  }

}
