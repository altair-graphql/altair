import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { fadeInOutAnimationTrigger } from '../../animations';
import { rand } from '../../utils';

interface LoadingTip {
  text: string;
  link: string;
  interval?: number;
}

// guesstimated average words per minute
const WPM = 150;

const DEFAULT_TIP_INTERVAL = 5000;

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  animations: [fadeInOutAnimationTrigger],
})
export class LoaderComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() loading = true;
  @Output() cancelChange = new EventEmitter();

  currentTip: LoadingTip | undefined;

  tipInterval: ReturnType<typeof setTimeout> | undefined = undefined;

  tips: LoadingTip[] = [
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

  ngAfterViewInit() {
    this.setupTipInterval();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loading?.currentValue !== undefined) {
      // if not loading, disable interval
      // if loading, set interval
      this.setupTipInterval();
    }
  }

  changeCurrentTip() {
    const idx = rand(0, this.tips.length - 1);
    this.currentTip = this.tips[idx];

    // Compute and cache interval if not available
    if (!this.currentTip.interval) {
      const words = this.currentTip.text.split(' ');
      const calculatedInterval = (words.length / WPM) * 60 * 1000;
      this.currentTip.interval = Math.max(
        calculatedInterval,
        DEFAULT_TIP_INTERVAL
      );
    }

    this.setupTipInterval();
  }

  setupTipInterval() {
    if (this.loading) {
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
    this.currentTip = undefined;
  }

  ngOnDestroy() {
    this.clearTipInterval();
  }
}
