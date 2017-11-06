import config from '../config';

// Track button click event
export const trackButton = e => {
  window['_gaq'].push(['_trackEvent', e.target.id, 'clicked']);
};

// Add event listener to all buttons
export const initTrackButtons = () => {
  const buttons = document.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButton);
  }
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

  initTrackButtons();
};
