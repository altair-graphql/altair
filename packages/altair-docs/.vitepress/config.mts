import { defineConfig } from 'vitepress';
import { getConfig } from './plugins/sidebar-generation';
import coreApiSidebar from '../api/core/typedoc-sidebar.json';
import { dynamicFiles } from './plugins/dynamic-files';

const { sidebar: retrievedSidebar } = getConfig({
  filter: (meta) => meta.sidebar !== false,
});

const seoTitle = 'Altair GraphQL Client';
const seoImage = '/assets/img/app-shot.png';
const description =
  'Altair is a feature-rich GraphQL Client IDE for all platforms. Enables you interact with any GraphQL server you are authorized to access from any platform you are on.';
const GA = 'UA-41432833-7';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Altair GraphQL Client',
  description,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'script',
      { async: '', src: `https://www.googletagmanager.com/gtag/js?id=${GA}` },
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA}');`,
    ],

    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=DM+Sans:400,500,700&display=swap',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css',
      },
    ],
    [
      'script',
      {
        src: 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js',
        'data-cfasync': 'false',
      },
    ],

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
  cleanUrls: true,
  themeConfig: {
    logo: '/assets/img/altair_logo_128.png',
    nav: [
      {
        text: 'Docs',
        link: '/docs/',
      },
      {
        text: 'Cloud ✨',
        link: '/cloud',
      },
      {
        text: 'Donate',
        link: 'https://opencollective.com/altair/donate',
      },
    ],
    sidebar: [
      retrievedSidebar[0],
      {
        text: 'Core API',
        link: '/api/core/',
        items: coreApiSidebar,
        collapsed: true,
      },
    ],
    socialLinks: [
      {
        icon: 'twitter',
        link: 'https://twitter.com/AltairGraphQL',
      },
      {
        icon: 'github',
        link: 'https://github.com/altair-graphql/altair',
      },
    ],
    carbonAds: {
      code: 'CEADPK37',
      placement: 'altairsirmueldesign',
    },
    editLink: {
      pattern:
        'https://github.com/altair-graphql/altair/edit/master/packages/altair-docs/:path',
      text: 'Help us improve this page!',
    },
    lastUpdated: {
      text: 'Last Updated',
    },
    search: {
      provider: 'local',
    },
  },
  transformHead({ page }) {
    // Skip the 404 page
    if (page !== '404.md') {
      const canonicalUrl = `https://altairgraphql.dev/${page}`
        .replace(/index\.md$/, '')
        .replace(/\.md$/, '');

      return [['link', { rel: 'canonical', href: canonicalUrl }]];
    }
  },
  sitemap: {
    hostname: 'https://altairgraphql.dev',
  },
  vite: {
    plugins: [dynamicFiles()],
  },
});
