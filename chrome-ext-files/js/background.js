/* global chrome */
(function () {
  const MAX_EXT_LOAD_COUNT = 30;
  let curTab = {
    id: null,
    url: null,
  };

  const getExtensionId = () => {
    const matches = chrome.runtime.getURL('x').match(/.*\/\/(.*)\/x$/);
    if (matches) {
      // https://stackoverflow.com/a/47060021/3929126
      // Mozilla uses an internal UUID on every installation to prevent fingerprinting
      return matches[1];
    }
    return chrome.runtime.id;
  };

  // Create a new tab for the extension
  function createNewTab() {
    chrome.tabs.create({ url: 'index.html' }, function (tab) {
      curTab = {
        id: tab.id,
        url: tab.url
      };

      // Handle donation logic
      // handleDonation();
    });
  }

  // Focus on the open extension tab
  function focusTab(tabId) {
    var updateProperties = { "active": true };
    chrome.tabs.update(tabId, updateProperties, function (tab) { });
  }

  function openChangeLog() {
    chrome.storage.sync.get({
      showChangeLog: true
    }, function (items) {
      if (items.showChangeLog) {
        chrome.tabs.create({
          url: "https://altairgraphql.dev/updated"
        }, function (tab) {
          console.log("New tab launched with https://altairgraphql.dev/updated");
        });
      }
    });
  }

  function handleDonation() {
    if (!chrome.runtime.getBrowserInfo) {
      // FIXME: A chrome extension
      chrome.storage.sync.get({
        userDonated: false,
        extLoadCount: 0,
      }, function (items) {
        if (!items.userDonated) {
          console.log('extension loaded count: ', items.extLoadCount);
          if (items.extLoadCount > MAX_EXT_LOAD_COUNT) {
            // show donation page
            chrome.tabs.create({ url: 'donate.html' }, function (tab) {
              console.log('New tab launched with donation.');
            });
            chrome.storage.sync.set({
              extLoadCount: 0
            });
          } else {
            chrome.storage.sync.set({
              extLoadCount: items.extLoadCount + 1
            });
          }
        }
      });
    }
  }

  // Open the extension tab when the extension icon is clicked
  chrome.browserAction.onClicked.addListener(function (tab) {
    if (!curTab || !curTab.id) {
      createNewTab();
    } else {
      chrome.tabs.get(curTab.id, function (tab) {
        console.log(chrome.runtime.id, tab.url);
        if (tab && tab.url && tab.url.includes(getExtensionId())) {
          focusTab(curTab.id);
        } else {
          createNewTab();
        }
      });
    }
  });

  // When a tab is closed, check if it is the extension tab that was closed, and unset curTabId
  chrome.tabs.onRemoved.addListener(function (tabId) {
    if (tabId === curTab.id) {
      curTab = {};
    }
  });

  // Show the update notification after every new update
  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'update') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/img/logo.png',
        title: 'Altair has been updated',
        message: 'Click to view changelog.'
      }, function(notifId) {
      });
    }
  });

  chrome.notifications.onClicked.addListener(function (notifId) {
    openChangeLog();
  });
})();
