import pageComponents from '@internal/page-components';
import GtmPlugin from './GtmPlugin';
/**
 * Client app enhancement file.
 *
 * https://v1.vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements
 */

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData, // site metadata
}) => {
  // ...apply enhancements for the site.
  // Temporary hack to fix unknown custom element error
  // https://github.com/vuejs/vuepress/issues/1173#issuecomment-470534176
  // for (const [name, component] of Object.entries(pageComponents)) {
  //   Vue.component(name, component)
  // }

  const GTM_ID = 'G-PEH31H4ZLH';

  if (
    process.env.NODE_ENV === 'production' &&
    GTM_ID &&
    typeof window !== 'undefined'
  ) {
    (function(w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);

    Vue.prototype.$gtm = Vue.gtm = new GtmPlugin();

    router.afterEach(function(to) {
      Vue.prototype.$gtm.trackView(to.name, to.fullPath);
    });
  }
};
