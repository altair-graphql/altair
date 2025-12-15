import { ICustomTheme, foundationColors } from '../theme';

const theme: ICustomTheme = {
  colors: {
    bg: foundationColors.black,
    offBg: '#343233',
    font: foundationColors.white,
    offFont: foundationColors.lightGray,
    border: '#565c64',
    offBorder: '#565656',
    headerBg: '#343233',
  },
  shadow: {
    opacity: 0.3,
  },
  editor: {
    colors: {
      comment: foundationColors.darkGray,
      string: foundationColors.orange,
      number: foundationColors.orange,
      variable: foundationColors.white,
      attribute: foundationColors.green,
      keyword: foundationColors.blue,
      atom: foundationColors.white,
      property: foundationColors.blue,
      definition: foundationColors.orange,
      punctuation: foundationColors.blue,
      cursor: foundationColors.blue,
    },
  },
};

export default theme;
