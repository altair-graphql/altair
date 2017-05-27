import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class DbService {
  storagePrefix = 'altair:';
  servicePrefix = 'db:';
  db$: Observable<any>;

  constructor() { }

  /**
   * Used to get the application-specific key
   * @param key The unique key for the data
   */
  private getItemName(key) {
    return `${this.storagePrefix}${this.servicePrefix}${key}`;
  }

  getItem(key) {
    const dbValue = localStorage.getItem(this.getItemName(key));

    return Observable.create((observer) => {
      if (dbValue) {
        try {
          const parsedValue = JSON.parse(dbValue);
          observer.next(parsedValue.value);
        } catch (err) {
          observer.next(dbValue);
        }
      }
    });
  }

  setItem(key, value) {
    const dbValue = {
      value: null
    };

    if (key && value) {
      dbValue.value = value;
    }

    localStorage.setItem(this.getItemName(key), JSON.stringify(dbValue));

    return Observable.create(obs => obs.next(null));
  }

}
