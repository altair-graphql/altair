import isElectron from './utils/is_electron';

const isTranslateMode = window['__ALTAIR_TRANSLATE__'];

export default {
  donation: {
    url: 'https://opencollective.com/altair/donate',
    action_count_threshold: 50
  },
  ga: 'UA-41432833-6',
  add_query_depth_limit: 3,
  tab_size: 2,
  max_windows: isElectron ? 50 : 15,
  default_language: isTranslateMode ? 'ach-UG' : 'default',
  languages: {
    'en-US': 'English',
    'fr-FR': 'French',
    'es-ES': 'Español',
    'cs-CZ': 'Czech',
    'de-DE': 'German',
    'pt-BR': 'Brazilian',
    'ru-RU': 'Russian',
    'zh-CN': '中文'
  },
  query_history_depth: isElectron ? 50 : 7,
  themes: ['light', 'dark'],
  isTranslateMode
};
