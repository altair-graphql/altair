import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-fork-repo',
  templateUrl: './fork-repo.component.html',
  styleUrls: ['./fork-repo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkRepoComponent {
  constructor() {}

  externalLink(e: Event, url: string) {
    e.preventDefault();

    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  }
}
