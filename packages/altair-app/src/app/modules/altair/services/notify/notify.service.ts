import { Injectable } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { ToastrService, ActiveToast, IndividualConfig } from 'ngx-toastr';
import { isExtension } from '../../utils';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store';
import { IDictionary } from '../../interfaces/shared';
import { first, take } from 'rxjs/operators';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { ConfirmToastComponent } from '../../components/confirm-toast/confirm-toast.component';
import sanitize from 'sanitize-html';
import { debug } from '../../utils/logger';

interface PushNotifyOptions {
  onclick?: () => void;
}

interface NotifyData {
  url?: string;
  action?: () => void;
}
type NotifyOptions = Partial<IndividualConfig & { data?: NotifyData }>;
type NotifyType = 'success' | 'error' | 'warning' | 'info';
@Injectable()
export class NotifyService {
  extensionNotifications: IDictionary = {};

  constructor(private toast: ToastrService, private store: Store<RootState>) {
    this.manageExtensionNotifications();
  }

  success(message: string, title = 'Altair', opts: NotifyOptions = {}) {
    this.exec('success', message, title, opts);
  }
  error(message: string, title = '', opts: NotifyOptions = {}) {
    this.exec('error', message, title, opts);
  }

  errorWithError(
    err: unknown,
    message: string,
    title = '',
    opts: NotifyOptions = {}
  ) {
    debug.error(err);
    this.exec('error', this.calculateErrorMessage(err) ?? message, title, opts);
  }
  warning(message: string, title = '', opts: NotifyOptions = {}) {
    this.store
      .select((state) => state.settings['alert.disableWarnings'])
      .pipe(take(1))
      .subscribe((disableWarnings) => {
        if (!disableWarnings) {
          return this.exec('warning', message, title, opts);
        }
      });
  }
  info(message: string, title = '', opts: NotifyOptions = {}) {
    this.exec('info', message, title, opts);
  }
  exec(
    type: NotifyType,
    message: string,
    title: string,
    opts: NotifyOptions = {}
  ) {
    const toast: ActiveToast<any> = this.toast[type](message, title, opts);
    if (opts?.data?.action) {
      const action = opts.data.action;
      toast.onTap.pipe(take(1)).subscribe((_toast) => {
        action();
      });
    }
    if (opts?.data?.url) {
      const url = opts.data.url;
      toast.onTap.pipe(take(1)).subscribe((_toast) => {
        window.open(url, '_blank');
      });
    }
    return toast;
    // let toastContent = message;

    // if (title) {
    //   toastContent = `<div><b>${title}</b></div>${toastContent}`;
    // }

    // if (opts.data?.url) {
    //   toastContent = `${toastContent}<a href="${opts.data.url}" target="_blank">Link</a>`;
    // }
    // return this.toast[type](message, {
    //   id: message,
    //   autoClose: !opts.disableTimeOut,
    // })
  }

  pushNotify(message: string, title = 'Altair', opts: PushNotifyOptions = {}) {
    if (isExtension) {
      return this.extensionPushNotify(message, title, opts);
    } else {
      return this.electronPushNotify(message, title, opts);
    }
  }

  electronPushNotify(
    message: string,
    title = 'Altair',
    opts: PushNotifyOptions = {}
  ) {
    this.store
      .select((state) => state.settings.disablePushNotification)
      .pipe(take(1))
      .toPromise()
      .then((disablePushNotification) => {
        if (disablePushNotification) {
          return;
        }

        const myNotification = new Notification(title, {
          body: message,
        });
        if (opts.onclick) {
          myNotification.onclick = opts.onclick;
        }

        return myNotification;
      });
  }

  extensionPushNotify(
    message: string,
    title = 'Altair',
    opts: PushNotifyOptions = {}
  ) {
    this.store
      .select((state) => state.settings.disablePushNotification)
      .pipe(take(1))
      .toPromise()
      .then((disablePushNotification) => {
        if (disablePushNotification) {
          return;
        }

        (window as any).chrome.notifications.create(
          {
            type: 'basic',
            iconUrl: 'assets/img/logo.png',
            title,
            message,
          },
          (notifId: string) => {
            if (opts) {
              this.extensionNotifications[notifId] = {};

              if (opts.onclick) {
                this.extensionNotifications[notifId].onclick = opts.onclick;
              }
            }
          }
        );
      });
  }

  async confirm(message: string, title = 'Altair') {
    const toast = this.toast.show(message, title, {
      toastComponent: ConfirmToastComponent,
      toastClass: 'ngx-toastr confirm-toast',
      disableTimeOut: true,
      tapToDismiss: false,
      closeButton: false,
    });

    return new Promise<boolean>((resolve, reject) => {
      toast.onHidden.pipe(take(1)).subscribe(() => {
        resolve(false);
      });
      toast.onAction.pipe(take(1)).subscribe(
        () => {
          resolve(true);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  private manageExtensionNotifications() {
    if (!isExtension) {
      return;
    }

    // Handle click events
    (window as any).chrome.notifications.onClicked.addListener(
      (notifId: string) => {
        if (
          this.extensionNotifications[notifId] &&
          this.extensionNotifications[notifId].onclick
        ) {
          this.extensionNotifications[notifId].onclick();
        }
      }
    );

    // Handle closed notifications
    (window as any).chrome.notifications.onClosed.addListener(
      (notifId: string) => {
        if (this.extensionNotifications[notifId]) {
          delete this.extensionNotifications[notifId];
        }
      }
    );
  }

  private calculateErrorMessage(err: unknown) {
    if (!err) {
      return;
    }
    if (typeof err === 'string') {
      return sanitize(err);
    }

    if (typeof err === 'object') {
      if ('error' in err && err.error && typeof err.error === 'object') {
        if ('code' in err.error && 'message' in err.error) {
          if (typeof err.error.message === 'string') {
            return sanitize(err.error.message);
          }
        }
      }

      if ('message' in err && typeof err.message === 'string') {
        return sanitize(err.message);
      }
    }
  }
}
