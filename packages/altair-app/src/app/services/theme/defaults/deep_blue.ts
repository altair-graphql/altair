import { ICustomTheme, createTheme } from '../theme';

const theme: ICustomTheme = {
  colors: {
    bg: '#030320',
    offBg: '#08082b',
    font: '#f2f1e8',
    offFont: '#f2f1e8',
    border: '#40414d',
    offBorder: '#383942',
    headerBg: '#08082b',
  },
  editor: {
    colors: {
      comment: '#626a73',
      string: '#f2f1e8',
      number: '#ffd674',
      variable: '#e34545',
      attribute: '#a8e197',
      keyword: '#e34545',
      atom: '#ff8bcb',
      property: '#69a9e3',
      punctuation: '#535374',
      cursor: '#e34545',
      definition: '#e34545',
    }
  }
};

export default theme;
