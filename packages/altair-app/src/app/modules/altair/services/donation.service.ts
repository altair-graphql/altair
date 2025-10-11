import { Observable, zip } from 'rxjs';
import { Injectable, inject } from '@angular/core';

import { DbService } from './db.service';
import { uaSeedHash } from '../utils/simple_hash';
import { map } from 'rxjs/operators';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

@Injectable()
export class DonationService {
  private dbService = inject(DbService);
  private store = inject<Store<RootState>>(Store);
  private altairConfig = inject(AltairConfig);

  private actionCountKey = 'dac';
  private seedKey = 'ds';
  private hashKey = 'dh';
  private seedBuff = 100000;

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
    const account$ = this.store.select('account');

    return zip(actionCount$, seed$, curHash$, account$).pipe(
      map(([actionCount, seed, curHash, account]) => {
        if (account.plan?.id === 'pro') {
          // Reset count
          this.dbService.setItem(this.actionCountKey, 0);
          return false;
        }
        if (
          actionCount &&
          actionCount >= this.altairConfig.donation.action_count_threshold
        ) {
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
      })
    );
  }
}
