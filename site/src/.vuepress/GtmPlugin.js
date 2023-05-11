export default class GtmPlugin {
  trackView(screenName, path) {
    let dataLayer = (window.dataLayer = window.dataLayer || []);
    dataLayer.push({
      event: 'content-view',
      'content-name': path,
    });
  }

  trackEvent({
    event = null,
    category = null,
    action = null,
    label = null,
    value = null,
    noninteraction = false,
    ...rest
  } = {}) {
    let dataLayer = (window.dataLayer = window.dataLayer || []);
    dataLayer.push({
      event: event || 'interaction',
      target: category,
      action: action,
      'target-properties': label,
      value: value,
      'interaction-type': noninteraction,
      ...rest,
    });
  }
}
