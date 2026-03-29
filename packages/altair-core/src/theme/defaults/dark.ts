import { ICustomTheme, foundationColors } from '../theme';

const theme: ICustomTheme = {
  'color.bg': foundationColors.black,
  'color.offBg': '#343233',
  'color.font': foundationColors.white,
  'color.offFont': foundationColors.lightGray,
  'color.border': '#565c64',
  'color.offBorder': '#565656',
  'color.headerBg': '#343233',
  'shadow.opacity': 0.3,
  'color.editor.comment': foundationColors.darkGray,
  'color.editor.string': foundationColors.orange,
  'color.editor.number': foundationColors.orange,
  'color.editor.variable': foundationColors.white,
  'color.editor.attribute': foundationColors.green,
  'color.editor.keyword': foundationColors.blue,
  'color.editor.atom': foundationColors.white,
  'color.editor.property': foundationColors.blue,
  'color.editor.definition': foundationColors.orange,
  'color.editor.punctuation': foundationColors.blue,
  'color.editor.cursor': foundationColors.blue,
};

export default theme;
