import isElectron from './utils/is_electron';

export default {
  donation: {
    url: 'https://opencollective.com/altair/donate',
    action_count_threshold: 50
  },
  ga: 'UA-41432833-6',
  add_query_depth_limit: 3,
  max_windows: 10,
  default_language: 'en',
  languages: { en: 'English', fr: 'French', es: 'Español', cn: '中文' },
  query_history_depth: isElectron ? 25 : 7,
  themes: ['light', 'dark']
};
