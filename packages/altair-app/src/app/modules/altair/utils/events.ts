/**
 * Event delegation
 * @param eventName
 * @param elSelector
 * @param fn
 * @example on('click', '.el', fn);
 */
export const on = <
  T extends Element,
  E extends keyof HTMLElementEventMap = 'click'
>(
  eventName: E,
  elSelector: string,
  fn: (this: T, e: HTMLElementEventMap[E]) => void
) => {
  document.body.addEventListener(eventName, function (e) {
    if (e.target && (e.target as T).matches(elSelector)) {
      fn.apply(e.target as T, [e]);
    }
  });
};

export const handleExternalLinks = () => {
  on<HTMLAnchorElement>('click', 'a', function (e) {
    const url = this.href || '';

    if (!url.replace(/#.*$/, '')) {
      // Handle hashes
      return;
    }
    e.preventDefault();

    // If electron app
    if (
      (window as any).process &&
      (window as any).process.versions['electron']
    ) {
      const electron = (window as any).require('electron');
      electron.shell.openExternal(url);
    } else {
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      }
    }
  });
};
