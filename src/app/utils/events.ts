
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
      fn(e);
    }
  });
};
