import { ICustomTheme, createTheme } from '../theme';

const theme: ICustomTheme = {
  colors: {
    bg: '#282a36',
    offBg: '#303240',
    font: '#f8f8f2',
    offFont: '#f8f8f2',
    border: '#40414d',
    offBorder: '#383942',
    headerBg: '#303240',
  },
  editor: {
    colors: {
      comment: '#6272a4',
      string: '#f1fa8c',
      number: '#bd93f9',
      variable: '#50fa7b',
      attribute: '#ff79c6',
      keyword: '#ff79c6',
      atom: '#bd93f9',
      property: '#bd93f9',
      punctuation: '#f8f8f2',
      cursor: '#f8f8f2',
    }
  }
};

export default theme;
