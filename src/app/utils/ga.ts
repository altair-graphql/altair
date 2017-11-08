import config from '../config';
import { on } from './events';

// Track button click event
export const trackButton = e => {
  window['_gaq'].push(['_trackEvent', `${e.target.innerText} (${e.target.className})`, 'clicked']);
};

// Track JavaScript errors
export const trackJSErrors = () => {
  window.addEventListener('error', (e: any) => {
    window['_gaq'].push([
      '_trackEvent',
      'JS Error',
      e.message,
      e.filename + ': ' + e.lineno,
      true
  ]);
  });
};

// Initialise tracking
export const initTracking = () => {
  window['_gaq'] = window['_gaq'] || [];

  window['_gaq'].push(['_setAccount', config.ga]);
  window['_gaq'].push(['_trackPageview']);

  const ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);

  // Listen for click events on buttons and links
  on('click', 'button', trackButton);
  on('click', 'a', trackButton);

  trackJSErrors();
};
