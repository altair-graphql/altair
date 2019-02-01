import config from '../config';
import { on } from './events';
import * as uuid from 'uuid/v4';
import { detectEnvironment } from '.';
import { environment } from 'environments/environment';
import { debug } from './logger';

const GA_URL = environment.production ? 'https://www.google-analytics.com/collect' : 'https://www.google-analytics.com/debug/collect';

export const sendTracking = (data) => {
  const cid = localStorage.getItem('altair:cid') || uuid();
  localStorage.setItem('altair:cid', cid);

  const bodyParams = {
    v: 1, // version
    aip: 1, // anonymize ip
    tid: config.ga, // tracking id
    cid, // client id
    ds: detectEnvironment(), // data source
    t: 'event', // Must be one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'.

    an: 'Altair', // application name
    av: environment.version, // application version

    dr: document.referrer, // document referrer
    sr: `${window.screen.availWidth}x${window.screen.availHeight}`, // screen resolution
    vp: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`, // viewport
    de: document.characterSet, // document encoding
    sd: `${screen.colorDepth}-bits`, // screen color depth
    ul: navigator.language, // user language
    je: +navigator.javaEnabled(), // java enabled
    dl: location.href, // document location url

    z: +(new Date()), // cache busting

    ...data
  };

  const bodyStr = Object.keys(bodyParams)
          .filter(key => bodyParams[key] !== undefined)
          .map(key => [key, encodeURIComponent(bodyParams[key])].join('='))
          .join('&');

  fetch(GA_URL, {
    method: 'POST',
    cache: 'no-cache',
    mode: 'cors',
    body: bodyStr
  }).catch(err => {});
};

export const trackPageview = () => {
  const bodyParams = {
    dh: location.hostname,
    dp: location.pathname,
    dt: document.title,
  };

  return sendTracking(bodyParams);
};

export const trackEvent = ({ category, action, label, value = undefined }) => {

  const bodyParams = {
    t: 'event', // Must be one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'.

    ec: category, // event category
    ea: action, // event action
    el: label, // event label
    ev: value, // event value
  };

  return sendTracking(bodyParams);
};

// Track button click event
export const trackButton = e => {
  const defaultCategory = 'Others';
  const trackCategory = e.target.getAttribute('track-id');
  const trackLabel = e.target.getAttribute('track-label') || `(${e.target.className})`;
  const category = trackCategory || defaultCategory;

  // window['_gaq'].push(['_trackEvent', category, `(${e.target.className})`, 'clicked']);
  trackEvent({ category, label: trackLabel, action: 'clicked'});
};

// Track JavaScript errors
export const trackJSErrors = () => {
  window.addEventListener('error', (e) => {
    debug.log(e);
    trackEvent({
      category: 'JS Error',
      action: e.message,
      label: `${e.filename}: ${e.lineno}:${e.colno} from ${e.srcElement} - ${window['__LAST_ACTION__']}`,
    });
    // window['_gaq'].push([
    //   '_trackEvent',
    //   'JS Error',
    //   e.message,
    //   e.filename + ': ' + e.lineno,
    //   true
    // ]);
  });
};

// Initialise tracking
export const initTracking = () => {
  // Disable GA
  // window['_gaq'] = window['_gaq'] || [];

  // window['_gaq'].push(['_setAccount', config.ga]);
  // window['_gaq'].push(['_setCustomVar', 4, 'User Device Protocol', window.location.protocol, 1]);
  // window['_gaq'].push(['_trackPageview']);

  // const ga = document.createElement('script');
  // ga.type = 'text/javascript';
  // ga.async = true;
  // ga.src = 'https://ssl.google-analytics.com/ga.js';
  // const s = document.getElementsByTagName('script')[0];
  // s.parentNode.insertBefore(ga, s);

  trackPageview();

  // // Listen for click events on buttons and links
  on('click', 'button, a, ._track_me, [track-id]', trackButton);

  trackJSErrors();
};
