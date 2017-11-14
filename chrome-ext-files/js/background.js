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
})();
