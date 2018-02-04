import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-fork-repo',
  templateUrl: './fork-repo.component.html',
  styleUrls: ['./fork-repo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForkRepoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  externalLink(e, url) {
    e.preventDefault();

    // If electron app
    if (window['process'] && window['process'].versions['electron']) {
      const electron = window['require']('electron');
      electron.shell.openExternal(url);
    } else {
      const win = window.open(url, '_blank');
      win.focus();
    }
  }

}
