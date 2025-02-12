import { getTabId, openAltairApp, removeTabId } from './helpers/tabs';

function openChangeLog() {
  chrome.storage.sync.get(
    {
      showChangeLog: true,
    },
    function (items) {
      if (items.showChangeLog) {
        chrome.tabs.create(
          {
            url: 'https://altairgraphql.dev/updated',
          },
          function (tab) {
            console.log('New tab launched with https://altairgraphql.dev/updated');
          }
        );
      }
    }
  );
}

// Open the extension tab when the extension icon is clicked
chrome.action.onClicked.addListener(function (tab) {
  openAltairApp();
});

// When a tab is closed, check if it is the extension tab that was closed, and unset curTabId
chrome.tabs.onRemoved.addListener(async function (tabId) {
  const curTabId = await getTabId();
  if (tabId === curTabId) {
    await removeTabId();
  }
});

// Show the update notification after every new update
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'update') {
    chrome.notifications.create(
      {
        type: 'basic',
        iconUrl: 'assets/img/logo.png',
        title: 'Altair has been updated',
        message: 'Click to view changelog.',
      },
      function (notifId) {}
    );
  }
});

chrome.notifications.onClicked.addListener(function (notifId) {
  openChangeLog();
});
