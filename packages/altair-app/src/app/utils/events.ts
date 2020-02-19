
/**
 * Event delegation
 * @param eventName
 * @param elSelector
 * @param fn
 * @example on('click', '.el', fn);
 */
export const on = (eventName: string, elSelector: string, fn: Function) => {
  document.body.addEventListener(eventName, function(e: Event) {
    if (e.target && (e.target as Element).matches(elSelector)) {
      fn.apply(e.target, [e]);
    }
  });
};

export const handleExternalLinks = () => {
  on('click', 'a', function(e: Event) {
    const url = (this.href || '');

    if (!url.replace(/#.*$/, '')) {
      // Handle hashes
      return;
    }
    e.preventDefault();

    // If electron app
    if ((window as any).process && (window as any).process.versions['electron']) {
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
