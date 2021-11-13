const { description } = require('../../package');
const getConfig = require('vuepress-bar');

const { sidebar: retrievedSidebar } = getConfig({ filter: (meta) => meta.sidebar !== false });
const seoTitle = 'Altair GraphQL Client';
const seoImage = '/assets/img/app-shot.png';
module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Altair GraphQL Client',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=DM+Sans:400,500,700&display=swap' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js', 'data-cfasync': 'false' }],

    // SEO
    ['meta', { name: 'description', content: description }],
    ['meta', { itemprop: 'name', content: seoTitle }],
    ['meta', { itemprop: 'description', content: description }],
    ['meta', { itemprop: 'image', content: seoImage }],
    ['meta', { name: 'author', content: 'Samuel Imolorhe' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: seoTitle }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: seoImage }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:title', content: seoTitle }],
    ['meta', { property: 'twitter:description', content: description }],
    ['meta', { property: 'twitter:image', content: seoImage }],
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: 'altair-graphql/altair',
    editLinks: false,
    docsDir: 'site/src', // defaults to false, set to true to enable
    editLinks: true,
    // custom text for edit link. Defaults to "Edit this page"
    editLinkText: 'Help us improve this page!',
    docsBranch: 'master',
    lastUpdated: true,
    smoothScroll: true,
    nav: [
      {
        text: 'Docs',
        link: '/docs/',
      },
      {
        text: 'Twitter',
        link: 'https://twitter.com/AltairGraphQL'
      },
      {
        text: 'Donate',
        link: 'https://opencollective.com/altair/donate'
      },
    ],
    sidebar: retrievedSidebar[0].children,
    // sidebar: {
    //   '/docs/': [
    //     {
    //       title: 'Guide',
    //       collapsable: false,
    //       children: [
    //         '',
    //         'using-vue',
    //       ]
    //     }
    //   ],
    // }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    'seo',
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-41432833-7',
      }
    ],
    [
      require('./plugins/github-metadata'),
      {
        owner: 'altair-graphql',
        repo: 'altair',
      }
    ],
  ]
}
