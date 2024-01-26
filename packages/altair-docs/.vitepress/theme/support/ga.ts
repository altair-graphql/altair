import { Router } from 'vitepress';
export function initGAEventTracking(
  router: Router,
  withBase: (path: string) => string
) {
  if (typeof window === 'undefined') {
    return;
  }

  document.body.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.matches && !el.matches('a')) {
      el = el.parentNode;
    }
    if (el && el !== document) {
      var trackCategory = el.getAttribute('track-category') || 'general';
      var trackAction = 'clicked';
      var trackLabel = el.getAttribute('track-label');

      // gtag('event', trackAction, {
      //   'event_category' : trackCategory,
      //   'event_label' : trackLabel
      // });
      if (window.ga) {
        ga('send', {
          hitType: 'event',
          eventCategory: trackCategory,
          eventAction: trackAction,
          eventLabel: trackLabel,
        });
      }
    }
  });
}
