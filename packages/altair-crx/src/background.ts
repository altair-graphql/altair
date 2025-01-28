let curTab: { id?: number; url?: string } = {
  id: undefined,
  url: undefined,
};

export const getExtensionId = () => {
  const matches = chrome.runtime.getURL('x').match(/.*\/\/(.*)\/x$/);
  if (matches) {
    // https://stackoverflow.com/a/47060021/3929126
    // Mozilla uses an internal UUID on every installation to prevent fingerprinting
    return matches[1];
  }
  return chrome.runtime.id;
};

// Create a new tab for the extension
export function createNewTab() {
  chrome.tabs.create({ url: 'altair-app/index.html' }, function (tab) {
    curTab = {
      id: tab.id,
      url: tab.url,
    };

    // Handle donation logic
    // handleDonation();
  });
}

// Focus on the open extension tab
function focusTab(tabId: number) {
  const updateProperties = { active: true };
  chrome.tabs.update(tabId, updateProperties, function (tab) {});
}

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
  if (!curTab?.id) {
    createNewTab();
  } else {
    chrome.tabs.get(curTab.id, function (tab) {
      console.log(chrome.runtime.id, tab.url);
      if (tab.url?.includes(getExtensionId() ?? '')) {
        if (curTab.id) {
          focusTab(curTab.id);
        }
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
