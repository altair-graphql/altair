
/**
 * Event delegation
 * @param eventName
 * @param elSelector
 * @param fn
 * @example on('click', '.el', fn);
 */
export const on = (eventName, elSelector, fn) => {
  document.body.addEventListener(eventName, function(e) {
    if (e.target && e.target.matches(elSelector)) {
      fn.apply(e.target, [e]);
    }
  });
};

export const handleExternalLinks = () => {
  on('click', 'a', function(e) {
    const url = (this.href || '');

    if (!url.replace(/#.*$/, '')) {
      // Handle hashes
      return;
    }
    e.preventDefault();

    // If electron app
    if (window['process'] && window['process'].versions['electron']) {
      const electron = window['require']('electron');
      electron.shell.openExternal(url);
    } else {
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      }
    }
  });
};
