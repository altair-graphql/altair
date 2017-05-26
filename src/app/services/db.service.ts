import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class DbService {
  storagePrefix = 'altair:';
  db$: Observable<any>;

  constructor() { }

  getItem(key) {
    const dbValue = localStorage.getItem(this.storagePrefix + key);
    // let parsedValue = null;

    // console.log(dbValue);
    // if (dbValue) {
    //   parsedValue = JSON.parse(dbValue);
    // }
    return Observable.create(observer => observer.next(dbValue));
    // return Promise.resolve(dbValue);
  }

  setItem(key, value) {
    localStorage.setItem(this.storagePrefix + key, value);

    return Observable.create(obs => obs.next(null));
  }

}
