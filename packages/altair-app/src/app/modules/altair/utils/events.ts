/**
 * Event delegation
 * @param eventName
 * @param elSelector
 * @param fn
 * @example on('click', '.el', fn);
 */
export const on = <T extends Element, E extends keyof HTMLElementEventMap = 'click'>(
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
    // eslint-disable-next-line no-invalid-this
    const url = this.href || '';

    if (!url.replace(/#.*$/, '')) {
      // Handle hashes
      return;
    }
    e.preventDefault();

    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  });
};
