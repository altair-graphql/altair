const { TouchBar } = require('electron');

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

// Spin button
const spin = new TouchBarButton({
  label: 'Would you like touchbar support in Altair?',
  // backgroundColor: '#7851A9',
  click: () => {
    console.log('Button clicked.');
    const issueUrl = 'https://github.com/imolorhe/altair/issues/180';
    require('electron').shell.openExternal(issueUrl);
  }
});

const touchBar = new TouchBar([
  spin
]);

module.exports = {
  touchBar
};
