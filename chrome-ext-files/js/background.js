(function () {
  var curTabId = null;

  // Create a new tab for the extension
  function createNewTab() {
    chrome.tabs.create({ url: 'index.html' }, function (tab) {
      curTabId = tab.id;
    });
  }

  // Focus on the open extension tab
  function focusTab(tabId) {
    var updateProperties = { "active": true };
    chrome.tabs.update(tabId, updateProperties, function (tab) { });
  }

  // Open the extension tab when the extension icon is clicked
  chrome.browserAction.onClicked.addListener(function (tab) {
    if (!curTabId) {
      createNewTab();
    } else {
      chrome.tabs.get(curTabId, function (tab) {
        if (tab) {
          focusTab(curTabId);
        } else {
          createNewTab();
        }
      });
    }
  });

  // When a tab is closed, check if it is the extension tab that was closed, and unset curTabId
  chrome.tabs.onRemoved.addListener(function (tabId) {
    if (tabId === curTabId) {
      curTabId = null;
    }
  });

  // Open the update page after every new update
  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'update') {
      chrome.storage.sync.get({
        showChangeLog: true
      }, function (items) {
        if (items.showChangeLog) {
          chrome.tabs.create({
            url: "https://altair.sirmuel.design/updated"
          }, function (tab) {
            console.log("New tab launched with https://altair.sirmuel.design/updated");
          });
        }
      });
    }
  });
})();
