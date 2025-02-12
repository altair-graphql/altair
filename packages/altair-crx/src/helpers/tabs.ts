const ALTAIR_APP_TAB_ID_STORAGE_KEY = 'altairAppTabId';

export const getTabId = async () => {
  const data = await chrome.storage.session.get([ALTAIR_APP_TAB_ID_STORAGE_KEY]);
  return data[ALTAIR_APP_TAB_ID_STORAGE_KEY] as number | undefined;
};
const setTabId = async (tabId: number) => {
  await chrome.storage.session.set({ [ALTAIR_APP_TAB_ID_STORAGE_KEY]: tabId });
};
export const removeTabId = async () => {
  await chrome.storage.session.remove(ALTAIR_APP_TAB_ID_STORAGE_KEY);
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
const createNewTab = async () => {
  const tab = await chrome.tabs.create({ url: 'altair-app/index.html' });

  if (!tab.id) {
    return;
  }

  await setTabId(tab.id);
};

// Focus on the open extension tab
const focusTab = async (tabId: number) => {
  const updateProperties = { active: true };
  await chrome.tabs.update(tabId, updateProperties);
};

export const openAltairApp = async () => {
  const tabId = await getTabId();

  if (!tabId) {
    await createNewTab();
  } else {
    const tab = await chrome.tabs.get(tabId);
    console.log(chrome.runtime.id, tab.url);
    if (tab.url?.includes(getExtensionId() ?? '')) {
      if (tabId) {
        await focusTab(tabId);
      }
    } else {
      await createNewTab();
    }
  }
};
