
import { Observable, zip } from 'rxjs';
import { Injectable } from '@angular/core';

import { DbService } from './db.service';
import { uaSeedHash } from '../utils/simple_hash';
import { switchMap, map } from 'rxjs/operators';
import { AltairConfig } from 'altair-graphql-core/build/config';

@Injectable()
export class DonationService {

  private actionCountKey = 'dac';
  private seedKey = 'ds';
  private hashKey = 'dh';
  private seedBuff = 100000;

  constructor(
    private dbService: DbService,
    private altairConfig: AltairConfig,
  ) { }

  donated() {
    const seed = Math.random() * this.seedBuff;

    // Store the seed
    this.dbService.setItem(this.seedKey, seed);

    // Store the seed hash
    this.dbService.setItem(this.hashKey, uaSeedHash(seed.toString()));

    // Reset the count
    this.dbService.setItem(this.actionCountKey, 0);
  }

  /**
   * counts the action and checks if the action is eligible to display the donation alert
  */
  trackAndCheckIfEligible(): Observable<boolean> {
    /**
     * Check if the count threshold has been reached.
     * Check if random seed exist
     * Check if hash of (seed+ua) matches [donated]
     * ~~ Show alert ~~
     * Reset counter
     */
    const actionCount$ = this.dbService.getItem(this.actionCountKey);
    const seed$ = this.dbService.getItem(this.seedKey);
    const curHash$ = this.dbService.getItem(this.hashKey);

    return zip(actionCount$, seed$, curHash$)
      .pipe(
        map(([ actionCount, seed, curHash ]) => {
          if (actionCount && actionCount >= this.altairConfig.donation.action_count_threshold) {
            // Reset count
            this.dbService.setItem(this.actionCountKey, 0);

            if (seed && uaSeedHash(seed) === curHash) {
              // User has donated already
              return false;
            } else {
              // User has not donated
              return true;
            }
          } else {
            // Increment count
            this.dbService.setItem(this.actionCountKey, actionCount + 1);

            return false;
          }
        }),
      );
  }
}
