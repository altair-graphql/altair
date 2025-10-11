import {
  Component,
  OnDestroy,
  effect,
  input,
} from '@angular/core';
import { rand } from '../../utils';
import { fadeInOutAnimationTrigger } from '../../animations';

interface Tip {
  text: string;
  link: string;
  interval?: number;
}

// slow words per minute
const WPM = 15;

const DEFAULT_TIP_INTERVAL = 60000;

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styles: ``,
  animations: [fadeInOutAnimationTrigger],
  standalone: false,
})
export class TipsComponent implements OnDestroy {
  readonly activeWindowId = input('');
  readonly windowId = input('');
  readonly loading = input(false);
  currentTip: Tip | undefined;

  tipInterval: ReturnType<typeof setTimeout> | undefined = undefined;

  tips: Tip[] = [
    {
      text: `You can go back in time to get a query you have previously executed, using 'History'`,
      link: 'https://altairgraphql.dev/docs/features/query-history.html',
    },

    {
      text: `Load your GraphQL schema directly into Altair from the docs, to continue working offline, or if your server has introspection disabled`,
      link: 'https://altairgraphql.dev/docs/features/documentation.html',
    },
    {
      text: `Backup the application state to a file and import it in a different system with all your queries and settings intact`,
      link: '',
    },
    {
      text: `Do you have a header that should be added to all your queries and windows? Just add it to the 'headers' in the Global environment`,
      link: 'https://altairgraphql.dev/docs/features/environment-variables.html#special-environment-variables',
    },
    {
      text: `Environment variables can be used everywhere! Even inside GraphQL queries! ✨`,
      link: 'https://altairgraphql.dev/docs/features/environment-variables.html#where-environment-variables-can-be-used',
    },
  ];

  constructor() {
    effect(() => {
      this.setupTipInterval(this.activeWindowId(), this.windowId(), this.loading());
    });
  }

  changeCurrentTip() {
    const idx = rand(0, this.tips.length - 1);
    this.currentTip = this.tips[idx];

    if (this.currentTip) {
      // Compute and cache interval if not available
      if (!this.currentTip.interval) {
        const words = this.currentTip.text.split(' ');
        const calculatedInterval = (words.length / WPM) * 60 * 1000;
        this.currentTip.interval = Math.max(
          calculatedInterval,
          DEFAULT_TIP_INTERVAL
        );
      }
    }

    this.setupTipInterval(this.activeWindowId(), this.windowId(), this.loading());
  }

  setupTipInterval(activeWindowId: string, windowId: string, loading: boolean) {
    if (activeWindowId === windowId && !loading) {
      clearTimeout(this.tipInterval);
      this.tipInterval = setTimeout(() => {
        if (this?.changeCurrentTip) {
          this.changeCurrentTip();
        }
      }, this.currentTip?.interval ?? DEFAULT_TIP_INTERVAL);
    } else {
      this.clearTipInterval();
    }
  }

  clearTipInterval() {
    clearTimeout(this.tipInterval);
    this.tipInterval = undefined;
  }

  ngOnDestroy() {
    this.clearTipInterval();
  }
}
