import { Injectable } from '@angular/core';
import { ToastrService, ActiveToast, ToastrConfig } from 'ngx-toastr';
import { isExtension } from '../../utils';

type NotifyOptions = Partial<ToastrConfig & { data: any }>;

@Injectable()
export class NotifyService {

  extensionNotifications = {};

  constructor(
    private toastr: ToastrService
  ) {
    this.manageExtensionNotifications();
  }

  success(message, title = 'Altair', opts: NotifyOptions = {}) {
    return this.exec('success', message, title, opts);
  }
  error(message, title = 'Altair', opts: NotifyOptions = {}) {
    return this.exec('error', message, title, opts);
  }
  warning(message, title = 'Altair', opts: NotifyOptions = {}) {
    return this.exec('warning', message, title, opts);
  }
  info(message, title = 'Altair', opts: NotifyOptions = {}) {
    return this.exec('info', message, title, opts);
  }
  exec(type, message, title, opts: NotifyOptions = {}): ActiveToast<any> {
    const toast: ActiveToast<any> = this.toastr[type](message, title, opts);
    if (opts.data && opts.data.url) {
      toast.onTap.subscribe(_toast => {
        window.open(opts.data.url, '_blank');
      })
    }
    return toast;
  }

  pushNotify(message, title = 'Altair', opts: any = {}) {
    if (isExtension) {
      return this.extensionPushNotify(message, title, opts);
    } else {
      return this.electronPushNotify(message, title, opts);
    }
  }

  electronPushNotify(message, title = 'Altair', opts: any = {}) {
    const myNotification = new Notification(title, {
      body: message
    });
    if (opts) {
      myNotification.onclick = opts.onclick;
    }

    return myNotification;
  }

  extensionPushNotify(message, title = 'Altair', opts: any = {}) {
    window['chrome'].notifications.create({
      type: 'basic',
      iconUrl: 'assets/img/logo.png',
      title,
      message
    }, notifId => {
      if (opts) {
        this.extensionNotifications[notifId] = {};

        if (opts.onclick) {
          this.extensionNotifications[notifId].onclick = opts.onclick;
        }
      }
    });
  }

  private manageExtensionNotifications() {
    if (!isExtension) {
      return;
    }

    // Handle click events
    window['chrome'].notifications.onClicked.addListener(notifId => {
      if (this.extensionNotifications[notifId] && this.extensionNotifications[notifId].onclick) {
        this.extensionNotifications[notifId].onclick();
      }
    });

    // Handle closed notifications
    window['chrome'].notifications.onClosed.addListener(notifId => {
      if (this.extensionNotifications[notifId]) {
        delete this.extensionNotifications[notifId];
      }
    });
  }
}
