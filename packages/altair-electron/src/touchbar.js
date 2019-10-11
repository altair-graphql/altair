const { TouchBar } = require('electron');

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;

const createTouchBar = actions => {

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

  const sendRequestButton = new TouchBarButton({
    label: 'Send Request',
    backgroundColor: '#7EBC59',
    click: actions.sendRequest,
  });

  const reloadDocsButton = new TouchBarButton({
    label: 'Reload Docs',
    click: actions.reloadDocs,
  });

  const showDocsButton = new TouchBarButton({
    label: 'Show Docs',
    click: actions.showDocs
  });

  const spacer = new TouchBarSpacer({
    size: 'flexible'
  });

  const touchBar = new TouchBar([
    // spin,
    sendRequestButton,
    spacer,
    reloadDocsButton,
    showDocsButton,
  ]);

  return touchBar;
};

module.exports = {
  createTouchBar,
};
