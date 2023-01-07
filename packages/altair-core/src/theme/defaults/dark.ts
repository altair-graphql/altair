import { ICustomTheme, createTheme, foundations } from '../theme';

const theme: ICustomTheme = {
  colors: {
    bg: foundations.colors.black,
    offBg: '#343233',
    font: foundations.colors.white,
    offFont: foundations.colors.lightGray,
    border: '#565c64',
    offBorder: '#565656',
    headerBg: '#343233',
  },
  shadow: {
    opacity: 0.3,
  },
  editor: {
    colors: {
      comment: foundations.colors.darkGray,
      string: foundations.colors.orange,
      number: foundations.colors.orange,
      variable: foundations.colors.white,
      attribute: foundations.colors.green,
      keyword: foundations.colors.blue,
      atom: foundations.colors.white,
      property: foundations.colors.blue,
      definition: foundations.colors.orange,
      punctuation: foundations.colors.blue,
      cursor: foundations.colors.blue,
    },
  },
};

export default theme;
