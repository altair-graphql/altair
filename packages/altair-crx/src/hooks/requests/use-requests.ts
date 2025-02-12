import { useEffect, useState } from 'react';
import { mockRequests } from './mock-requests';
import { getRequest } from '../../helpers/request';
import { GraphQLRequest } from '../../types';
import { isExtension } from '../../helpers/messaging';

const useCurrentTab = () => {
  const [tabId, setTabId] = useState<number | undefined>(undefined);
  const browser = window.chrome || window.browser;

  if (!isExtension()) {
    return;
  }
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length) {
      const tabId = tabs[0]?.id;
      if (tabId) {
        setTabId(tabId);
      }
    }
  });

  return tabId;
};
const useTabStatus = () => {
  const currentTabId = useCurrentTab();
  const [tabStatus, setTabStatus] = useState<'loading' | 'complete' | 'unloaded'>(
    'unloaded'
  );
  const browser = window.chrome || window.browser;

  if (!isExtension()) {
    return tabStatus;
  }
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === currentTabId) {
      if (changeInfo.status && changeInfo.status !== tabStatus) {
        setTabStatus(changeInfo.status as 'loading' | 'complete');
      }
    }
  });

  // TODO: Add cleanup logic

  return tabStatus;
};
export const useGraphQLRequests = () => {
  const browser = window.chrome || window.browser;
  const [requests, setRequests] = useState<GraphQLRequest[]>([]);
  const tabStatus = useTabStatus();
  useEffect(() => {
    if (tabStatus === 'loading') {
      // Clear requests when the tab is loading
      setRequests([]);
    }
  }, [tabStatus]);

  if (!isExtension()) {
    return {
      requests: mockRequests,
    };
  }

  browser.devtools.network.onRequestFinished.addListener(async (request) => {
    const data = await getRequest(request);
    if (!data) {
      return;
    }
    setRequests((prevRequests) => [
      ...prevRequests.filter((r) => {
        return r.id !== data.id;
      }),
      data,
    ]);
  });

  // TODO: Add cleanup logic
  return {
    requests,
  };
};
