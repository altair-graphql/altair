
import {of as observableOf,  Observable ,  Subscriber } from 'rxjs';
import { Injectable } from '@angular/core';

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

  /**
   * Gets the item with the exact name specified
   * @param key
   */
  getItemByExactKey(key): Observable<any> {
    const dbValue = localStorage.getItem(key);

    return Observable.create((observer: Subscriber<any>) => {
      if (dbValue) {
        try {
          const parsedValue = JSON.parse(dbValue);
          observer.next(parsedValue.value);
        } catch (err) {
          observer.next(dbValue);
        }
      } else {
        observer.next(null);
      }
    });
  }

  /**
   * Gets the item with the key provided
   * The key is retrieved with the application-specific key
   * @param key
   */
  getItem(key): Observable<any> {
    return this.getItemByExactKey(this.getItemName(key));
  }

  /**
   * Stores a value with the specified application key
   * @param key
   * @param value
   */
  setItem(key, value): Observable<any> {
    const dbValue = {
      value: null
    };

    if (key && value) {
      dbValue.value = value;
    }

    localStorage.setItem(this.getItemName(key), JSON.stringify(dbValue));

    return Observable.create(obs => obs.next(null));
  }

  /**
   * Removes an item with the specified exact key
   * @param key
   */
  removeItemByExactKey(key): Observable<any> {
    localStorage.removeItem(key);

    return Observable.create(obs => obs.next(null));
  }

  /**
   * Removes an item with the specified application key
   * @param key
   */
  removeItem(key) {
    return this.removeItemByExactKey(this.getItemName(key));
  }

  /**
   * Gets all the keys of the items stored
   */
  getAllKeys() {
    // Get all the items in the local storage that is specific to the app
    const allKeys = Object.keys(localStorage).filter((key: string) => key.includes(this.storagePrefix));

    // return Observable.combineLatest(allKeys.map(key => this.getItemByExactKey(key)));
    return observableOf(allKeys);
  }

}
